import re
import uuid
from contextvars import ContextVar


_VALID_CORRELATION_ID = re.compile(r"^[A-Za-z0-9._:-]{1,128}$")
correlation_id_context: ContextVar[str | None] = ContextVar(
    "lostlink_correlation_id",
    default=None,
)


def resolve_correlation_id(value: str | None) -> str:
    if value is not None and _VALID_CORRELATION_ID.fullmatch(value):
        return value
    return str(uuid.uuid4())


class CorrelationMiddleware:
    def __init__(self, app) -> None:
        self.app = app

    async def __call__(self, scope, receive, send) -> None:
        if scope.get("type") != "http":
            await self.app(scope, receive, send)
            return

        raw_value = next(
            (
                value
                for name, value in scope.get("headers", [])
                if name.lower() == b"x-correlation-id"
            ),
            None,
        )
        inbound_value = raw_value.decode("latin-1") if raw_value else None
        correlation_id = resolve_correlation_id(inbound_value)
        token = correlation_id_context.set(correlation_id)

        async def send_with_correlation(message) -> None:
            if message.get("type") == "http.response.start":
                headers = [
                    (name, value)
                    for name, value in message.get("headers", [])
                    if name.lower() != b"x-correlation-id"
                ]
                headers.append((b"x-correlation-id", correlation_id.encode("ascii")))
                message = {**message, "headers": headers}
            await send(message)

        try:
            await self.app(scope, receive, send_with_correlation)
        finally:
            correlation_id_context.reset(token)
