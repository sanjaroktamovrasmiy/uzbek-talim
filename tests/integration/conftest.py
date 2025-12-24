"""
Integration test fixtures.
"""

import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

