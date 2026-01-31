terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# S3 Bucket para archivos de entrada (texto)
resource "aws_s3_bucket" "input_bucket" {
  bucket = "${var.project_name}-input-${var.environment}-${random_id.bucket_suffix.hex}"

  tags = {
    Name        = "Study Vault Input Bucket"
    Environment = var.environment
    Project     = var.project_name
  }
}

# S3 Bucket para archivos de salida (audio)
resource "aws_s3_bucket" "output_bucket" {
  bucket = "${var.project_name}-output-${var.environment}-${random_id.bucket_suffix.hex}"

  tags = {
    Name        = "Study Vault Output Bucket"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Genera un sufijo aleatorio para nombres únicos de buckets
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# IAM Role para Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name    = "Study Vault Lambda Role"
    Project = var.project_name
  }
}

# Política para que Lambda pueda leer de S3 input
resource "aws_iam_role_policy" "lambda_s3_input_policy" {
  name = "${var.project_name}-lambda-s3-input-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.input_bucket.arn}/*"
      }
    ]
  })
}

# Política para que Lambda pueda escribir en S3 output
resource "aws_iam_role_policy" "lambda_s3_output_policy" {
  name = "${var.project_name}-lambda-s3-output-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject"
        ]
        Resource = "${aws_s3_bucket.output_bucket.arn}/*"
      }
    ]
  })
}

# Política para que Lambda pueda usar Polly
resource "aws_iam_role_policy" "lambda_polly_policy" {
  name = "${var.project_name}-lambda-polly-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "polly:SynthesizeSpeech"
        ]
        Resource = "*"
      }
    ]
  })
}

# Política básica de Lambda para CloudWatch Logs
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role.name
}

# Función Lambda
resource "aws_lambda_function" "text_to_speech" {
  filename         = "${path.module}/../lambda/function.zip"
  function_name    = "${var.project_name}-text-to-speech-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "text_to_speech.lambda_handler"
  source_code_hash = filebase64sha256("${path.module}/../lambda/function.zip")
  runtime         = "python3.9"
  timeout         = 60
  memory_size     = 256

  environment {
    variables = {
      OUTPUT_BUCKET = aws_s3_bucket.output_bucket.id
    }
  }

  tags = {
    Name    = "Study Vault Lambda"
    Project = var.project_name
  }
}

# Permiso para que S3 invoque Lambda
resource "aws_lambda_permission" "allow_s3" {
  statement_id  = "AllowExecutionFromS3"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.text_to_speech.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.input_bucket.arn
}

# Notificación S3 para invocar Lambda
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.input_bucket.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.text_to_speech.arn
    events              = ["s3:ObjectCreated:*"]
    filter_suffix       = ".txt"
  }

  depends_on = [aws_lambda_permission.allow_s3]
}