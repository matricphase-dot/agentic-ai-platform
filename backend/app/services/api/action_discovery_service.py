"""Action Discovery Service for Universal API Connector"""
import json
import re
from typing import Dict, List, Any, Optional
import httpx
from urllib.parse import urljoin, urlparse
import yaml
import logging

logger = logging.getLogger(__name__)

class ActionDiscoveryService:
    def __init__(self):
        self.http_client = httpx.AsyncClient(timeout=30.0)
        self.supported_methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]
    
    async def discover_from_openapi(self, openapi_url: str, auth_config: Dict = None) -> Dict[str, Any]:
        """Discover and parse actions from OpenAPI/Swagger specification"""
        
        try:
            # Fetch OpenAPI specification
            if openapi_url.startswith("http"):
                response = await self.http_client.get(openapi_url)
                spec = response.json() if "application/json" in response.headers.get("content-type", "") else yaml.safe_load(response.text)
            else:
                with open(openapi_url, 'r') as f:
                    spec = yaml.safe_load(f) if openapi_url.endswith(('.yaml', '.yml')) else json.load(f)
            
            # Validate OpenAPI version
            if not spec.get("openapi") and not spec.get("swagger"):
                raise ValueError("Not a valid OpenAPI/Swagger specification")
            
            # Extract base URL
            servers = spec.get("servers", [])
            base_url = servers[0].get("url") if servers else ""
            
            # Discover actions from paths
            actions = []
            paths = spec.get("paths", {})
            
            for path, path_item in paths.items():
                for method, operation in path_item.items():
                    if method.upper() not in self.supported_methods:
                        continue
                    
                    action = self._parse_operation_to_action(
                        operation=operation,
                        method=method.upper(),
                        path=path,
                        base_url=base_url,
                        spec=spec
                    )
                    
                    if action:
                        actions.append(action)
            
            # Extract authentication schemes
            security_schemes = spec.get("components", {}).get("securitySchemes", {})
            
            return {
                "success": True,
                "spec_version": spec.get("openapi") or spec.get("swagger"),
                "title": spec.get("info", {}).get("title", ""),
                "description": spec.get("info", {}).get("description", ""),
                "base_url": base_url,
                "actions_found": len(actions),
                "actions": actions,
                "security_schemes": security_schemes,
                "raw_spec": spec
            }
            
        except Exception as e:
            logger.error(f"Failed to discover actions from OpenAPI: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "actions": []
            }
    
    def _parse_operation_to_action(self, operation: Dict, method: str, path: str, base_url: str, spec: Dict) -> Optional[Dict]:
        """Parse an OpenAPI operation into an executable action"""
        
        try:
            # Generate action name
            action_name = self._generate_action_name(operation, method, path)
            
            # Extract parameters
            parameters = self._extract_parameters(operation.get("parameters", []))
            
            # Extract request body schema
            request_body = self._extract_request_body(operation.get("requestBody", {}))
            
            # Extract response schemas
            responses = self._extract_responses(operation.get("responses", {}))
            
            # Extract security requirements
            security = operation.get("security", [])
            
            # Build full URL
            full_url = urljoin(base_url, path) if base_url else path
            
            # Create agent prompt template
            agent_prompt = self._create_agent_prompt_template(
                action_name=action_name,
                description=operation.get("description", operation.get("summary", "")),
                method=method,
                path=path,
                parameters=parameters,
                request_body=request_body
            )
            
            return {
                "id": f"{method}_{path}".lower().replace("/", "_").replace("{", "").replace("}", ""),
                "name": action_name,
                "description": operation.get("description", operation.get("summary", "")),
                "method": method,
                "path": path,
                "full_url": full_url,
                "operation_id": operation.get("operationId", ""),
                "parameters": parameters,
                "request_body": request_body,
                "responses": responses,
                "security": security,
                "tags": operation.get("tags", []),
                "agent_prompt_template": agent_prompt,
                "estimated_complexity": self._calculate_complexity(operation)
            }
            
        except Exception as e:
            logger.warning(f"Failed to parse operation: {str(e)}")
            return None
    
    def _generate_action_name(self, operation: Dict, method: str, path: str) -> str:
        """Generate a human-readable action name"""
        
        # Try operationId first
        if operation.get("operationId"):
            return operation["operationId"]
        
        # Generate from method and path
        method_prefix = {
            "GET": "get_",
            "POST": "create_",
            "PUT": "update_",
            "DELETE": "delete_",
            "PATCH": "patch_",
            "HEAD": "head_",
            "OPTIONS": "options_"
        }.get(method, "")
        
        # Clean path segments
        path_segments = [seg for seg in path.split("/") if seg and not seg.startswith("{")]
        if path_segments:
            last_segment = path_segments[-1]
            # Convert kebab-case or camelCase to snake_case
            last_segment = re.sub(r'([a-z])([A-Z])', r'\1_\2', last_segment)
            last_segment = last_segment.replace("-", "_").lower()
            return f"{method_prefix}{last_segment}"
        
        return f"{method_prefix}action"
    
    def _extract_parameters(self, parameters: List) -> List[Dict]:
        """Extract and normalize parameters"""
        extracted = []
        
        for param in parameters:
            param_info = {
                "name": param.get("name"),
                "in": param.get("in"),  # query, header, path, cookie
                "required": param.get("required", False),
                "description": param.get("description", ""),
                "schema": param.get("schema", {}),
                "example": param.get("example")
            }
            
            # Add enum values if present
            if "schema" in param and "enum" in param["schema"]:
                param_info["enum"] = param["schema"]["enum"]
            
            extracted.append(param_info)
        
        return extracted
    
    def _extract_request_body(self, request_body: Dict) -> Optional[Dict]:
        """Extract request body schema"""
        if not request_body:
            return None
        
        content = request_body.get("content", {})
        if "application/json" in content:
            return {
                "content_type": "application/json",
                "schema": content["application/json"].get("schema", {}),
                "required": request_body.get("required", False),
                "description": request_body.get("description", "")
            }
        
        # Fallback to first content type
        for content_type, content_spec in content.items():
            return {
                "content_type": content_type,
                "schema": content_spec.get("schema", {}),
                "required": request_body.get("required", False),
                "description": request_body.get("description", "")
            }
        
        return None
    
    def _extract_responses(self, responses: Dict) -> Dict:
        """Extract response schemas"""
        extracted = {}
        
        for status_code, response in responses.items():
            content = response.get("content", {})
            schema = {}
            
            if "application/json" in content:
                schema = content["application/json"].get("schema", {})
            
            extracted[status_code] = {
                "description": response.get("description", ""),
                "schema": schema,
                "headers": response.get("headers", {})
            }
        
        return extracted
    
    def _create_agent_prompt_template(self, action_name: str, description: str, method: str, 
                                     path: str, parameters: List, request_body: Optional[Dict]) -> str:
        """Create a prompt template for AI agents"""
        
        template = f"""You are about to execute the API action: {action_name}

Description: {description}

HTTP Method: {method}
Endpoint Path: {path}

{'Parameters:' if parameters else 'No parameters required.'}
{self._format_parameters_for_prompt(parameters)}

{'Request Body Schema:' if request_body else 'No request body required.'}
{self._format_request_body_for_prompt(request_body) if request_body else ''}

Instructions:
1. Analyze the user's request and extract relevant data
2. Construct appropriate parameters based on the schema
3. Format the request according to the expected structure
4. Handle authentication automatically
5. Parse the response and return it in a user-friendly format

Example format for your internal reasoning:
{{
  "action": "{action_name}",
  "parameters": {{"param1": "value1"}},
  "request_body": {{"field": "value"}},
  "expected_response_format": "json"
}}"""

        return template
    
    def _format_parameters_for_prompt(self, parameters: List) -> str:
        """Format parameters for the agent prompt"""
        if not parameters:
            return ""
        
        lines = []
        for param in parameters:
            required = "[REQUIRED]" if param.get("required") else "[OPTIONAL]"
            param_type = param.get("schema", {}).get("type", "string")
            desc = param.get("description", "")
            lines.append(f"- {param['name']} ({param['in']}) {required}: {desc} (Type: {param_type})")
        
        return "\n".join(lines)
    
    def _format_request_body_for_prompt(self, request_body: Dict) -> str:
        """Format request body for the agent prompt"""
        if not request_body:
            return ""
        
        schema = request_body.get("schema", {})
        required = "[REQUIRED]" if request_body.get("required") else "[OPTIONAL]"
        
        # Simple schema description
        if "properties" in schema:
            props = []
            for prop_name, prop_schema in schema["properties"].items():
                prop_type = prop_schema.get("type", "string")
                prop_desc = prop_schema.get("description", "")
                props.append(f"    - {prop_name}: {prop_desc} (Type: {prop_type})")
            
            return f"Content-Type: {request_body['content_type']} {required}\nProperties:\n" + "\n".join(props)
        
        return f"Content-Type: {request_body['content_type']} {required}\nSchema: {json.dumps(schema, indent=2)}"
    
    def _calculate_complexity(self, operation: Dict) -> str:
        """Calculate complexity level of an operation"""
        
        params_count = len(operation.get("parameters", []))
        has_request_body = "requestBody" in operation
        responses = operation.get("responses", {})
        
        complexity_score = params_count * 0.5
        
        if has_request_body:
            complexity_score += 2
        
        if "200" in responses and "schema" in responses.get("200", {}).get("content", {}).get("application/json", {}):
            complexity_score += 1
        
        if complexity_score < 2:
            return "low"
        elif complexity_score < 4:
            return "medium"
        else:
            return "high"
    
    async def validate_connector(self, openapi_url: str, test_endpoint: str = None) -> Dict:
        """Validate that the API connector works"""
        
        discovery_result = await self.discover_from_openapi(openapi_url)
        
        if not discovery_result["success"]:
            return {
                "valid": False,
                "error": discovery_result["error"],
                "actions": 0
            }
        
        # Optional: Test a simple endpoint if provided
        if test_endpoint:
            try:
                test_url = urljoin(discovery_result["base_url"], test_endpoint.lstrip("/"))
                test_response = await self.http_client.get(test_url, timeout=10)
                
                return {
                    "valid": True,
                    "test_passed": test_response.status_code < 400,
                    "test_status": test_response.status_code,
                    "actions": discovery_result["actions_found"],
                    "base_url": discovery_result["base_url"],
                    "title": discovery_result["title"]
                }
            except Exception as e:
                return {
                    "valid": True,  # Still valid, just test failed
                    "test_passed": False,
                    "test_error": str(e),
                    "actions": discovery_result["actions_found"],
                    "base_url": discovery_result["base_url"],
                    "title": discovery_result["title"]
                }
        
        return {
            "valid": True,
            "actions": discovery_result["actions_found"],
            "base_url": discovery_result["base_url"],
            "title": discovery_result["title"]
        }
