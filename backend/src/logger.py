import http
import logging
import time

from fastapi import Request, Response

# Disable uvicorn access logger
uvicorn_access = logging.getLogger("uvicorn.access")
uvicorn_access.disabled = True

logger = logging.getLogger("uvicorn")
logger.setLevel(logging.getLevelName(logging.DEBUG))


class Colors:
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    ENDC = "\033[0m"


async def log_request_middleware(request: Request, call_next):
    """
    This middleware will log all requests and their processing time.
    E.g. log:
    0.0.0.0:1234 - GET /ping 200 OK 1.00ms
    """
    url = f"{request.url.path}?{request.query_params}" if request.query_params else request.url.path
    start_time = time.time()
    response: Response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    formatted_process_time = "{0:.2f}".format(process_time)
    host = request.client.host
    port = request.client.port
    code = response.status_code
    status_phrase = http.HTTPStatus(response.status_code).phrase
    color = Colors.RED
    if code >= 200 and code < 300:
        color = Colors.GREEN
    elif code >= 300 and code < 400:
        color = Colors.YELLOW
    logger.info(f'{host}:{port} - "{request.method} {url}" {color}{response.status_code} {status_phrase}{Colors.ENDC} {formatted_process_time}ms')
    return response
