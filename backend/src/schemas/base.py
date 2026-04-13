from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ListResponseSchema(BaseModel, Generic[T]):
    data: list[T]
    count: int
