import os
import boto3 
import json
from django.contrib.auth import authenticate, login, logout 
from django.http import JsonResponse 
from django.views.decorators.csrf import csrf_exempt 
from django.views.decorators.http import require_POST
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID", "").strip()
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY", "").strip()
AWS_S3_REGION_NAME = os.environ.get("AWS_S3_REGION_NAME", "eu-north-1").strip()
BUCKET_NAME = os.environ.get("AWS_STORAGE_BUCKET_NAME", "").strip()

# Check for missing configuration
missing_keys = []
if not AWS_ACCESS_KEY_ID:
    missing_keys.append("AWS_ACCESS_KEY_ID")
if not AWS_SECRET_ACCESS_KEY:
    missing_keys.append("AWS_SECRET_ACCESS_KEY")
if not BUCKET_NAME:
    missing_keys.append("AWS_STORAGE_BUCKET_NAME")
if missing_keys:
    raise ValueError(f"Missing AWS configuration keys: {', '.join(missing_keys)}. Check your env file.")

# Initialize the S3 client
s3 = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY, 
    region_name=AWS_S3_REGION_NAME
)

@csrf_exempt
@require_POST
def list_uploaded_files_view(request):
    username = request.GET.get("name")
    certificate_type = request.GET.get("certificate_type")
    document_name = request.GET.get("document_name")

    if not username or not certificate_type:
        return JsonResponse({"error": "Missing required fields: name or certificate_type."}, status=400)

    folder_prefix = f"{username}/{certificate_type}/{document_name}"
    
    print(f"Fetching files from S3 with prefix: {folder_prefix}")  # Debug log

    try:
        response = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix=folder_prefix)
        print(f"S3 Response: {response}")  # Debug log
    except Exception as e:
        return JsonResponse({"error": f"Error fetching files: {str(e)}"}, status=500)

    if "Contents" not in response:
        print("No files found in S3")
        return JsonResponse({"message": "No files found."}, status=200)

    files = [
        {
            "file_name": obj["Key"].split("/")[-1],  
            "file_key": obj["Key"],  
            "size": obj["Size"],  
            "last_modified": obj["LastModified"].isoformat(),  
        }
        for obj in response.get("Contents", [])
    ]

    print(f"Returning files: {files}")  # Debug log

    return JsonResponse({"files": files}, status=200)


@csrf_exempt
@require_POST
def upload_certificate_view(request):
    username = request.POST.get("name")
    certificate_type = request.POST.get("certificate_type")
    pdf_file = request.FILES.get("pdf_file")
    document_name = request.POST.get("document_name")
    
    if not username or not certificate_type or not pdf_file:
        return JsonResponse(
            {"error": "Missing required fields: name, certificate_type, or pdf_file, document_name."}, status=400
        )

    folder_prefix = f"{username}/{certificate_type}/{document_name}/"
    file_key = f"{folder_prefix}{pdf_file.name}"  # Ensure correct key structure

    
    try:
        response = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix=folder_prefix, MaxKeys=1)
    except Exception as e:
        return JsonResponse({"error": f"Error checking folder existence: {str(e)}"}, status=500)
    
    if "Contents" not in response:
        try:
            s3.put_object(Bucket=BUCKET_NAME, Key=folder_prefix)
        except Exception as e:
            return JsonResponse({"error": f"Error creating folder: {str(e)}"}, status=500)
    
    file_key = folder_prefix + pdf_file.name

    try:
        s3.upload_fileobj(pdf_file, BUCKET_NAME, file_key)
    except Exception as e:
        return JsonResponse({"error": f"File upload failed: {str(e)}"}, status=500)
    
    return JsonResponse({"message": "File uploaded successfully", "file_key": file_key})

from django.views.decorators.http import require_GET

# @csrf_exempt
# @require_GET
# def list_uploaded_files_view(request):
#     username = request.GET.get("name")
#     certificate_type = request.GET.get("certificate_type")
    
#     if not username or not certificate_type:
#         return JsonResponse(
#             {"error": "Missing required fields: name or certificate_type."},
#             status=400
#         )
    
#     folder_prefix = f"{username}/{certificate_type}/"

#     try:
#         response = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix=folder_prefix)
#     except Exception as e:
#         return JsonResponse({"error": f"Error fetching files: {str(e)}"}, status=500)

#     if "Contents" not in response:
#         return JsonResponse({"message": "No files found."}, status=200)

#     files = [
#         {
#             "file_name": obj["Key"].split("/")[-1],  # Extract filename from path
#             "file_key": obj["Key"],  # Full S3 key
#             "size": obj["Size"],  # File size in bytes
#             "last_modified": obj["LastModified"].isoformat(),  # Convert datetime to string
#         }
#         for obj in response.get("Contents", [])
#     ]

#     return JsonResponse({"files": files}, status=200)


@csrf_exempt
@require_POST
def login_view(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return JsonResponse({'error': 'Username and password are required.'}, status=400)
    
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({'message': 'Login successful'}, status=200)
    else:
        return JsonResponse({'error': 'Invalid credentials'}, status=401)

@csrf_exempt
@require_POST
def logout_view(request):
    if request.user.is_authenticated:
        logout(request)
        return JsonResponse({'message': 'Logout successful'}, status=200)
    else:
        return JsonResponse({'error': 'User is not authenticated'}, status=401)
