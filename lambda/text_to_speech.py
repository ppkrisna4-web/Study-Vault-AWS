import json
import boto3
import os
from urllib.parse import unquote_plus

# Inicializar clientes de AWS
s3_client = boto3.client('s3')
polly_client = boto3.client('polly')

def lambda_handler(event, context):
    """
    Función Lambda que convierte texto a audio usando Amazon Polly
    """
    
    # Obtener información del bucket y archivo desde el evento S3
    try:
        # El evento contiene información sobre el archivo subido
        bucket_name = event['Records'][0]['s3']['bucket']['name']
        file_key = unquote_plus(event['Records'][0]['s3']['object']['key'])
        
        print(f"Procesando archivo: {file_key} del bucket: {bucket_name}")
        
        # Leer el archivo de texto desde S3
        response = s3_client.get_object(Bucket=bucket_name, Key=file_key)
        text_content = response['Body'].read().decode('utf-8')
        
        print(f"Contenido leído: {len(text_content)} caracteres")
        
        # Validar que el texto no esté vacío
        if not text_content.strip():
            print("Error: El archivo está vacío")
            return {
                'statusCode': 400,
                'body': json.dumps('El archivo de texto está vacío')
            }
        
        # Limitar el texto si es muy largo (Polly tiene límites)
        # Polly acepta hasta 3000 caracteres en una solicitud
        if len(text_content) > 3000:
            print(f"Advertencia: Texto truncado de {len(text_content)} a 3000 caracteres")
            text_content = text_content[:3000]
        
        # Convertir texto a audio con Amazon Polly
        print("Llamando a Amazon Polly...")
        polly_response = polly_client.synthesize_speech(
            Text=text_content,
            OutputFormat='mp3',
            VoiceId='Lupe',  # Voz en español (femenina)
            Engine='neural'   # Motor neural para mejor calidad
        )
        
        # Leer el audio generado
        audio_stream = polly_response['AudioStream'].read()
        
        print(f"Audio generado: {len(audio_stream)} bytes")
        
        # Generar nombre para el archivo de salida
        output_file_name = file_key.replace('.txt', '.mp3')
        
        # Bucket de salida (definido en variable de entorno)
        output_bucket = os.environ['OUTPUT_BUCKET']
        
        # Guardar el archivo de audio en S3
        s3_client.put_object(
            Bucket=output_bucket,
            Key=output_file_name,
            Body=audio_stream,
            ContentType='audio/mpeg'
        )
        
        print(f"Audio guardado exitosamente en: s3://{output_bucket}/{output_file_name}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Conversión exitosa',
                'input_file': f's3://{bucket_name}/{file_key}',
                'output_file': f's3://{output_bucket}/{output_file_name}'
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error al procesar: {str(e)}')
        }