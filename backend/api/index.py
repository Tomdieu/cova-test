import os
import io

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from django.core.wsgi import get_wsgi_application
from django.contrib.staticfiles.handlers import StaticFilesHandler

application = StaticFilesHandler(get_wsgi_application())


def handler(request, response):
    req = request
    method = req.get('method', 'GET')
    path = req.get('path', '/')
    query = req.get('queryString', '')
    headers = req.get('headers', {})
    body = req.get('body', '')

    environ = {
        'REQUEST_METHOD': method,
        'SCRIPT_NAME': '',
        'PATH_INFO': path,
        'QUERY_STRING': query,
        'SERVER_NAME': 'vercel.app',
        'SERVER_PORT': '443',
        'SERVER_PROTOCOL': 'HTTP/1.1',
        'HTTPS': 'on',
        'wsgi.input': io.BytesIO(body.encode() if isinstance(body, str) else body if body else b''),
        'wsgi.errors': io.StringIO(),
        'wsgi.url_scheme': 'https',
        'wsgi.multithread': False,
        'wsgi.multiprocess': False,
        'wsgi.run_once': False,
    }

    content_type = ''
    content_length = '0'
    for key, value in headers.items():
        low = key.lower()
        if low == 'content-type':
            content_type = value
        elif low == 'content-length':
            content_length = value
        else:
            wsgi_key = 'HTTP_' + key.upper().replace('-', '_')
            environ[wsgi_key] = value

    environ['CONTENT_TYPE'] = content_type
    environ['CONTENT_LENGTH'] = content_length

    status_code = [200]
    resp_headers = []

    def start_response(status, resp_hdrs, exc_info=None):
        status_code[0] = int(status.split(' ')[0])
        resp_headers.extend(resp_hdrs)

    result = application(environ, start_response)
    body_bytes = b''.join(result)

    return {
        'statusCode': status_code[0],
        'headers': dict(resp_headers),
        'body': body_bytes.decode('utf-8', errors='replace'),
    }
