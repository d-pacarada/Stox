using Microsoft.AspNetCore.Mvc;

namespace StoxAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HelloController : ControllerBase
    {
        [HttpGet]
        public string Get()
        {
            return "Hello from Stox API!";
        }
    }
}
