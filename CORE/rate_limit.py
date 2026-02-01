from slowapi import Limiter, _rate_limit_exceeded_handler 
from slowapi.util import get_remote_address 
from slowapi.errors import RateLimitExceeded 
 
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"]) 
 
def setup_rate_limiting(app): 
    app.state.limiter = limiter 
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler) 
 
    # Tiered rate limits 
    @app.on_event("startup") 
    async def set_rate_limits(): 
        limiter.limit("10/minute")(free_endpoints) 
        limiter.limit("1000/minute")(premium_endpoints) 
        limiter.limit("10000/minute")(enterprise_endpoints) 
