using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using time_service.Services;
using time_service.Models;
using time_service.Models.DTOs;
using time_service.Data;
using System.Security.Claims;

namespace time_service.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/time")]
    public class TimeController : ControllerBase
    {
        private readonly ITimeService _timeService;
        private readonly ApplicationDbContext _context;

        public TimeController(ITimeService timeService, ApplicationDbContext context)
        {
            _timeService = timeService;
            _context = context;
        }

        private string? GetUserEmail()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        [HttpGet("getCurrentSession")]
        public async Task<ActionResult<CurrentSessionOut>> GetCurrentSession()
        {
            try
            {
                var userEmail = GetUserEmail();
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized();
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
                if (user == null)
                {
                    return NotFound("Użytkownik nie odnaleziony");
                }

                var result = await _timeService.GetCurrentSession(user);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("startSession")]
        public async Task<IActionResult> StartSession()
        {
            try
            {
                var userEmail = GetUserEmail();
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized();
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
                if (user == null)
                {
                    return NotFound("Użytkownik nie odnaleziony");
                }

                var result = await _timeService.StartNewSession(user);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("stopSession")]
        public async Task<IActionResult> StopSession()
        {
            try
            {
                var userEmail = GetUserEmail();
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized();
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
                if (user == null)
                {
                    return NotFound("Użytkownik nie odnaleziony");
                }

                var result = await _timeService.StopSession(user);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("weekly-summary")]
        public async Task<ActionResult<WeeklySummaryResponse>> GetWeeklySummary([FromQuery] int weekOffset = 0, [FromQuery] long? userId = null)
        {
            try
            {
                var userEmail = GetUserEmail();
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized();
                }

                var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
                if (currentUser == null)
                {
                    return NotFound("Użytkownik nie odnaleziony");
                }

                var result = await _timeService.GetWeeklySummary(currentUser, weekOffset, userId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}