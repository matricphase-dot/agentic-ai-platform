"""Universal API Execution Engine"""
import httpx
import json
import asyncio
from typing import Dict, Any, Optional, List
from cryptography.fernet import Fernet
import base64
import os
from datetime import datetime, timedelta
import uuid
import logging
from urllib.parse import urljoin, urlencode

logger = logging.getLogger(__name__)

class APIExecutionError(Exception):
    """Custom exception for API execution errors"""
    def __init__(self, message: str, action: str = None, connector: str = None, status_code: int = None):
        self.message = message
        self.action = action
        self.connector = connector
        self.status_code = status_code
        super().__init__(self.message)

class APIExecutionService:
    def __init__(self):
        self.http_client = httpx.AsyncClient(timeout=30.0, follow_redirects=True)
        self.cipher_suite = Fernet(os.getenv("ENCRYPTION_KEY", Fernet.generate_key()))
        self.cache = {}  # Simple in-memory cache for credentials
    
    async def execute_action(
        self,
        connector_config: Dict[str, Any],
        action_config: Dict[str, Any],
        user_credentials: Dict[str, Any],
        parameters: Dict[str, Any] = None,
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Execute an API action with the given parameters"""
        
        start_time = datetime.now()
        execution_id = str(uuid.uuid4())
        
        try:
            # 1. Prepare request
            request_data = await self._prepare_request(
                connector_config=connector_config,
                action_config=action_config,
                user_credentials=user_credentials,
                parameters=parameters or {},
                context=context or {}
            )
            
            # 2. Execute the HTTP request
            logger.info(f"Executing {action_config['method']} {request_data['url']}")
            
            response = await self._make_http_request(
                method=action_config["method"],
                url=request_data["url"],
                headers=request_data["headers"],
                data=request_data.get("body"),
                params=request_data.get("query_params"),
                auth_data=request_data.get("auth")
            )
            
            # 3. Process response
            response_data = await self._process_response(response, action_config)
            
            # 4. Calculate metrics
            latency_ms = (datetime.now() - start_time).total_seconds() * 1000
            
            # 5. Log execution (async)
            asyncio.create_task(self._log_execution(
                execution_id=execution_id,
                connector_id=connector_config.get("id"),
                action_name=action_config["name"],
                request_data=request_data,
                response_data=response_data,
                latency_ms=latency_ms,
                success=True,
                user_id=context.get("user_id") if context else None
            ))
            
            # 6. Format final response
            return {
                "success": True,
                "execution_id": execution_id,
                "action": action_config["name"],
                "connector": connector_config["name"],
                "status_code": response.status_code,
                "latency_ms": round(latency_ms, 2),
                "data": response_data,
                "headers": dict(response.headers),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            latency_ms = (datetime.now() - start_time).total_seconds() * 1000
            
            # Log error
            asyncio.create_task(self._log_execution(
                execution_id=execution_id,
                connector_id=connector_config.get("id"),
                action_name=action_config.get("name", "unknown"),
                request_data={"error": str(e)},
                response_data={},
                latency_ms=latency_ms,
                success=False,
                user_id=context.get("user_id") if context else None,
                error_message=str(e)
            ))
            
            # Raise structured error
            if isinstance(e, httpx.HTTPStatusError):
                raise APIExecutionError(
                    message=f"HTTP {e.response.status_code}: {e.response.text[:200]}",
                    action=action_config.get("name"),
                    connector=connector_config.get("name"),
                    status_code=e.response.status_code
                )
            elif isinstance(e, httpx.RequestError):
                raise APIExecutionError(
                    message=f"Network error: {str(e)}",
                    action=action_config.get("name"),
                    connector=connector_config.get("name")
                )
            else:
                raise APIExecutionError(
                    message=str(e),
                    action=action_config.get("name"),
                    connector=connector_config.get("name")
                )
    
    async def _prepare_request(
        self,
        connector_config: Dict[str, Any],
        action_config: Dict[str, Any],
        user_credentials: Dict[str, Any],
        parameters: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Prepare all components of the HTTP request"""
        
        # 1. Build URL
        url = self._build_url(
            base_url=connector_config["base_url"],
            path=action_config["path"],
            path_params=parameters.get("path", {}),
            query_params=parameters.get("query", {})
        )
        
        # 2. Build headers
        headers = self._build_headers(
            connector_config=connector_config,
            action_config=action_config,
            user_credentials=user_credentials,
            context=context
        )
        
        # 3. Build request body
        body = None
        if action_config.get("request_body") and action_config["method"] in ["POST", "PUT", "PATCH"]:
            body = self._build_request_body(
                schema=action_config["request_body"].get("schema", {}),
                parameters=parameters.get("body", {}),
                content_type=action_config["request_body"].get("content_type", "application/json")
            )
        
        # 4. Prepare authentication
        auth = self._prepare_auth(
            auth_type=connector_config.get("auth_type"),
            credentials=user_credentials,
            connector_config=connector_config
        )
        
        return {
            "url": url,
            "headers": headers,
            "body": body,
            "query_params": parameters.get("query", {}),
            "auth": auth,
            "method": action_config["method"]
        }
    
    def _build_url(self, base_url: str, path: str, path_params: Dict, query_params: Dict) -> str:
        """Build complete URL with path parameters and query string"""
        
        # Replace path parameters
        formatted_path = path
        for key, value in path_params.items():
            placeholder = "{" + key + "}"
            if placeholder in formatted_path:
                formatted_path = formatted_path.replace(placeholder, str(value))
        
        # Build full URL
        full_url = urljoin(base_url, formatted_path)
        
        # Add query parameters
        if query_params:
            query_string = urlencode({k: v for k, v in query_params.items() if v is not None})
            full_url = f"{full_url}?{query_string}"
        
        return full_url
    
    def _build_headers(self, connector_config: Dict, action_config: Dict, 
                      user_credentials: Dict, context: Dict) -> Dict[str, str]:
        """Build HTTP headers including authentication"""
        
        headers = {
            "User-Agent": "Agentic-AI-Platform/1.0",
            "X-Request-ID": str(uuid.uuid4()),
            "X-Execution-Context": json.dumps(context) if context else "",
            "X-Platform-Version": "1.0.0"
        }
        
        # Add content type if there's a body
        if action_config.get("request_body"):
            content_type = action_config["request_body"].get("content_type", "application/json")
            headers["Content-Type"] = content_type
        
        # Add API-specific headers from connector config
        api_headers = connector_config.get("headers", {})
        headers.update(api_headers)
        
        # Add authentication headers
        auth_headers = self._get_auth_headers(
            auth_type=connector_config.get("auth_type"),
            credentials=user_credentials,
            connector_config=connector_config
        )
        headers.update(auth_headers)
        
        return {k: v for k, v in headers.items() if v is not None}
    
    def _get_auth_headers(self, auth_type: str, credentials: Dict, connector_config: Dict) -> Dict[str, str]:
        """Get authentication headers based on auth type"""
        
        if not auth_type or not credentials:
            return {}
        
        if auth_type == "api_key":
            api_key = self._decrypt_credential(credentials.get("api_key"))
            key_name = connector_config.get("auth_config", {}).get("key_name", "Authorization")
            key_location = connector_config.get("auth_config", {}).get("key_location", "header")
            
            if key_location == "header":
                return {key_name: api_key}
            elif key_location == "query":
                # Will be added to query params instead
                return {}
        
        elif auth_type == "bearer_token":
            token = self._decrypt_credential(credentials.get("access_token"))
            return {"Authorization": f"Bearer {token}"}
        
        elif auth_type == "basic_auth":
            username = self._decrypt_credential(credentials.get("username"))
            password = self._decrypt_credential(credentials.get("password"))
            auth_string = f"{username}:{password}"
            encoded_auth = base64.b64encode(auth_string.encode()).decode()
            return {"Authorization": f"Basic {encoded_auth}"}
        
        elif auth_type == "oauth2":
            access_token = self._decrypt_credential(credentials.get("access_token"))
            if access_token:
                return {"Authorization": f"Bearer {access_token}"}
        
        return {}
    
    def _prepare_auth(self, auth_type: str, credentials: Dict, connector_config: Dict) -> Optional[Any]:
        """Prepare authentication for HTTP client"""
        
        if not auth_type or not credentials:
            return None
        
        if auth_type == "basic_auth":
            username = self._decrypt_credential(credentials.get("username"))
            password = self._decrypt_credential(credentials.get("password"))
            return httpx.BasicAuth(username=username, password=password)
        
        # For other auth types, headers are used instead
        return None
    
    def _build_request_body(self, schema: Dict, parameters: Dict, content_type: str) -> Any:
        """Build request body according to schema and content type"""
        
        if not parameters:
            return None
        
        if content_type == "application/json":
            # Validate against schema if available
            if schema.get("type") == "object" and "properties" in schema:
                # Basic validation - check required fields
                required_fields = schema.get("required", [])
                for field in required_fields:
                    if field not in parameters:
                        raise ValueError(f"Missing required field: {field}")
            
            return json.dumps(parameters)
        
        elif content_type == "application/x-www-form-urlencoded":
            return parameters  # httpx will encode this
        
        elif content_type.startswith("multipart/form-data"):
            # Handle file uploads
            files = {}
            for key, value in parameters.items():
                if isinstance(value, dict) and value.get("type") == "file":
                    # Handle file upload
                    files[key] = (value.get("filename"), value.get("content"))
                else:
                    files[key] = (None, str(value))
            return files
        
        else:
            # Default to JSON
            return json.dumps(parameters)
    
    async def _make_http_request(self, method: str, url: str, headers: Dict, 
                                data: Any, params: Dict, auth_data: Any) -> httpx.Response:
        """Make the actual HTTP request"""
        
        request_kwargs = {
            "method": method,
            "url": url,
            "headers": headers,
            "timeout": 30.0
        }
        
        if data:
            if method in ["POST", "PUT", "PATCH"]:
                if isinstance(data, dict) and any(isinstance(v, tuple) for v in data.values()):
                    # Multipart form data
                    request_kwargs["files"] = data
                else:
                    request_kwargs["data"] = data
        
        if params:
            request_kwargs["params"] = params
        
        if auth_data:
            request_kwargs["auth"] = auth_data
        
        try:
            response = await self.http_client.request(**request_kwargs)
            response.raise_for_status()
            return response
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error {e.response.status_code} for {method} {url}")
            raise
            
        except httpx.RequestError as e:
            logger.error(f"Request error for {method} {url}: {str(e)}")
            raise
    
    async def _process_response(self, response: httpx.Response, action_config: Dict) -> Dict[str, Any]:
        """Process and validate the HTTP response"""
        
        content_type = response.headers.get("content-type", "")
        
        try:
            if "application/json" in content_type:
                data = response.json()
            elif "text/" in content_type:
                data = {"text": response.text}
            else:
                data = {"content": response.content[:1000], "content_type": content_type}
            
            # Basic validation against response schema
            if action_config.get("responses"):
                expected_status = str(response.status_code)
                if expected_status in action_config["responses"]:
                    response_schema = action_config["responses"][expected_status].get("schema", {})
                    # TODO: Add proper JSON schema validation
            
            return {
                "status_code": response.status_code,
                "data": data,
                "headers": dict(response.headers)
            }
            
        except json.JSONDecodeError:
            return {
                "status_code": response.status_code,
                "data": {"text": response.text},
                "headers": dict(response.headers),
                "warning": "Response was not valid JSON"
            }
    
    def _decrypt_credential(self, encrypted_value: str) -> Optional[str]:
        """Decrypt an encrypted credential"""
        if not encrypted_value:
            return None
        
        try:
            decrypted = self.cipher_suite.decrypt(encrypted_value.encode())
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Failed to decrypt credential: {str(e)}")
            return None
    
    async def _log_execution(self, execution_id: str, connector_id: str, action_name: str,
                            request_data: Dict, response_data: Dict, latency_ms: float,
                            success: bool, user_id: int = None, error_message: str = None):
        """Log execution details to database (simplified version)"""
        
        # In production, this would save to the database
        log_entry = {
            "execution_id": execution_id,
            "connector_id": connector_id,
            "action_name": action_name,
            "timestamp": datetime.now().isoformat(),
            "latency_ms": latency_ms,
            "success": success,
            "user_id": user_id,
            "error_message": error_message
        }
        
        logger.info(f"API Execution logged: {json.dumps(log_entry)}")
        
        # TODO: Implement actual database logging
        # await self.db.save_execution_log(log_entry)
    
    async def batch_execute(self, executions: List[Dict]) -> List[Dict]:
        """Execute multiple API actions in parallel"""
        
        tasks = []
        for exec_config in executions:
            task = self.execute_action(
                connector_config=exec_config["connector"],
                action_config=exec_config["action"],
                user_credentials=exec_config.get("credentials", {}),
                parameters=exec_config.get("parameters", {}),
                context=exec_config.get("context", {})
            )
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        formatted_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                formatted_results.append({
                    "success": False,
                    "error": str(result),
                    "execution_index": i
                })
            else:
                formatted_results.append(result)
        
        return formatted_results
    
    async def close(self):
        """Cleanup resources"""
        await self.http_client.aclose()
