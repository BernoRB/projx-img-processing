# Grupo de seguridad para la instancia EC2
resource "aws_security_group" "ec2_sg" {
  name        = "${var.project_name}-${var.environment}-ec2-sg"
  description = "Security group for EC2 instance running Docker containers"

  # Acceso SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Acceso HTTP para el servicio de upload
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Acceso HTTP para el servicio de processing
  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Tráfico de salida permitido a todos los destinos
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-ec2-sg"
    Environment = var.environment
  }
}

# Rol IAM para la instancia EC2
resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-${var.environment}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-ec2-role"
    Environment = var.environment
  }
}

# Política para acceso a S3
resource "aws_iam_policy" "ec2_s3_access" {
  name        = "${var.project_name}-${var.environment}-ec2-s3-access"
  description = "Allow EC2 to access S3 buckets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Effect = "Allow"
        Resource = [
          "arn:aws:s3:::${var.s3_bucket_original}",
          "arn:aws:s3:::${var.s3_bucket_original}/*",
          "arn:aws:s3:::${var.s3_bucket_processed}",
          "arn:aws:s3:::${var.s3_bucket_processed}/*"
        ]
      }
    ]
  })
}

# Política para acceso a DynamoDB
resource "aws_iam_policy" "ec2_dynamodb_access" {
  name        = "${var.project_name}-${var.environment}-ec2-dynamodb-access"
  description = "Allow EC2 to access DynamoDB table"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:dynamodb:${var.aws_region}:*:table/${var.dynamodb_table_name}"
      }
    ]
  })
}

# Política para acceso a SQS
resource "aws_iam_policy" "ec2_sqs_access" {
  name        = "${var.project_name}-${var.environment}-ec2-sqs-access"
  description = "Allow EC2 to access SQS queues"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:GetQueueUrl"
        ]
        Effect = "Allow"
        Resource = [
          var.sqs_processing_queue_arn,
          var.sqs_lambda_queue_arn,
          var.sqs_completion_queue_arn
        ]
      }
    ]
  })
}

# Adjuntar políticas al rol
resource "aws_iam_role_policy_attachment" "ec2_s3" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ec2_s3_access.arn
}

resource "aws_iam_role_policy_attachment" "ec2_dynamodb" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ec2_dynamodb_access.arn
}

resource "aws_iam_role_policy_attachment" "ec2_sqs" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ec2_sqs_access.arn
}

# Perfil de instancia para adjuntar el rol a EC2
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-${var.environment}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# Script de inicialización (user data)
locals {
  user_data = <<-EOF
    #!/bin/bash
    # Actualizar el sistema
    dnf update -y
    
    # Instalar Docker
    dnf install -y docker
    systemctl start docker
    systemctl enable docker
    usermod -a -G docker ec2-user
    
    # Instalar Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Instalar Git y jq
    dnf install -y git jq
    
    # Crear directorio para la aplicación
    mkdir -p /app
    chown ec2-user:ec2-user /app
    
    # Crear archivo docker-compose.yml con las imágenes pre-construidas
    cat > /app/docker-compose.yml <<'DOCKERCOMPOSE'
    version: '3'
    
    services:
      upload-service:
        image: ${var.docker_image_upload}
        ports:
          - "3000:3000"
        environment:
          - AWS_REGION=${var.aws_region}
          - AWS_ACCESS_KEY_ID=${var.aws_access_key_id}
          - AWS_SECRET_ACCESS_KEY=${var.aws_secret_access_key}
          - S3_BUCKET_ORIGINAL=${var.s3_bucket_original}
          - S3_BUCKET_PROCESSED=${var.s3_bucket_processed}
          - DYNAMO_TABLE=${var.dynamodb_table_name}
          - SQS_PROCESSING_QUEUE_URL=${var.sqs_processing_queue_url}
        restart: always
    
      processing-service:
        image: ${var.docker_image_processing}
        ports:
          - "3001:3001"
        environment:
          - AWS_REGION=${var.aws_region}
          - AWS_ACCESS_KEY_ID=${var.aws_access_key_id}
          - AWS_SECRET_ACCESS_KEY=${var.aws_secret_access_key}
          - S3_BUCKET_ORIGINAL=${var.s3_bucket_original}
          - S3_BUCKET_PROCESSED=${var.s3_bucket_processed}
          - DYNAMO_TABLE=${var.dynamodb_table_name}
          - SQS_PROCESSING_QUEUE_URL=${var.sqs_processing_queue_url}
          - SQS_LAMBDA_QUEUE_URL=${var.sqs_lambda_queue_url}
          - SQS_COMPLETION_QUEUE_URL=${var.sqs_completion_queue_url}
        restart: always
    DOCKERCOMPOSE
    
    # Iniciar los servicios
    cd /app
    docker-compose pull
    docker-compose up -d
  EOF
}

# Instancia EC2
resource "aws_instance" "app_server" {
  ami                    = var.ami_id
  instance_type          = "t2.micro"
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  
  user_data = local.user_data
  
  tags = {
    Name        = "${var.project_name}-server"
    Environment = var.environment
  }
}