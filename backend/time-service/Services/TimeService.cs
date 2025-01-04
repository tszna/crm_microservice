using Microsoft.EntityFrameworkCore;
using time_service.Models;
using time_service.Models.DTOs;
using time_service.Data;

namespace time_service.Services
{
    public interface ITimeService
    {
        Task<object> StartNewSession(User user);
        Task<object> StopSession(User user);
        Task<CurrentSessionOut> GetCurrentSession(User user);
        Task<WeeklySummaryResponse> GetWeeklySummary(User currentUser, int weekOffset, long? userId);
        int CalculateCountTime(User user);
        string FormatDuration(int seconds);
    }

    public class TimeService : ITimeService
    {
        private readonly ApplicationDbContext _context;

        public TimeService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<WeeklySummaryResponse> GetWeeklySummary(User currentUser, int weekOffset, long? userId)
        {
            var selectedUser = userId.HasValue 
                ? await _context.Users.FirstOrDefaultAsync(u => u.Id == userId)
                : currentUser;

            if (selectedUser == null)
            {
                throw new InvalidOperationException("Użytkownik nie znaleziony.");
            }

            var today = DateTime.Today;
            var startOfWeek = today.AddDays(7 * weekOffset);
            startOfWeek = startOfWeek.AddDays(-(int)startOfWeek.DayOfWeek + (int)DayOfWeek.Monday);
            var endOfWeek = startOfWeek.AddDays(6);

            var startOfWeekDateTime = startOfWeek;
            var endOfWeekDateTime = endOfWeek.AddDays(1).AddTicks(-1);

            var sessions = await _context.TimeSessions
                .Where(s => s.UserId == selectedUser.Id &&
                           s.StartTime >= startOfWeekDateTime &&
                           s.StartTime <= endOfWeekDateTime)
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            var dailySummary = new Dictionary<string, DailySummary>();
            var currentDate = startOfWeek;
            while (currentDate <= endOfWeek)
            {
                dailySummary[currentDate.ToString("yyyy-MM-dd")] = new DailySummary
                {
                    Time = "-",
                    IsActive = false
                };
                currentDate = currentDate.AddDays(1);
            }

            int weeklyTotalInSeconds = 0;

            var sessionsByDate = sessions.GroupBy(s => s.StartTime.Date);
            foreach (var group in sessionsByDate)
            {
                var sessionDate = group.Key;
                var lastSession = group.Last();
                var dateStr = sessionDate.ToString("yyyy-MM-dd");

                int dailyTotalInSeconds = 0;
                bool isActive = false;

                if (lastSession.FullElapsedTime.HasValue)
                {
                    dailyTotalInSeconds = (int)lastSession.FullElapsedTime.Value.TotalSeconds;
                    weeklyTotalInSeconds += dailyTotalInSeconds;
                }
                else
                {
                    isActive = true;
                }

                if (dailySummary.TryGetValue(dateStr, out var summary))
                {
                    summary.Time = dailyTotalInSeconds > 0 ? FormatDuration(dailyTotalInSeconds) : "-";
                    summary.IsActive = isActive;
                }
            }

            var users = await _context.Users
                .Select(u => new UserSummary { Id = u.Id, Name = u.Name })
                .ToListAsync();

            return new WeeklySummaryResponse
            {
                DailySummary = dailySummary,
                WeeklyTotal = FormatDuration(weeklyTotalInSeconds),
                WeekOffset = weekOffset,
                Users = users,
                SelectedUserId = selectedUser.Id
            };
        }

        public async Task<CurrentSessionOut> GetCurrentSession(User user)
        {
            var today = DateTime.Today;
            var startOfDay = today;
            var endOfDay = today.AddDays(1).AddTicks(-1);

            var sessions = await _context.TimeSessions
                .Where(s => s.UserId == user.Id && s.StartTime >= startOfDay && s.StartTime <= endOfDay)
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            if (!sessions.Any())
            {
                return new CurrentSessionOut
                {
                    StartTime = null,
                    EndTime = null,
                    ElapsedTime = "00:00:00",
                    CountTime = 0,
                    IsActive = false
                };
            }

            int totalSeconds = 0;
            bool isActive = false;

            foreach (var session in sessions)
            {
                if (session.EndTime.HasValue && session.ElapsedTime.HasValue)
                {
                    totalSeconds += (int)session.ElapsedTime.Value.TotalSeconds;
                }
                else if (!session.EndTime.HasValue)
                {
                    var duration = DateTime.Now - session.StartTime;
                    totalSeconds += (int)duration.TotalSeconds;
                    isActive = true;
                }
            }

            var latestSession = sessions.Last();

            return new CurrentSessionOut
            {
                StartTime = sessions[0].StartTime.ToString("HH:mm:ss"),
                EndTime = latestSession.EndTime?.ToString("HH:mm:ss"),
                ElapsedTime = FormatDuration(totalSeconds),
                CountTime = totalSeconds,
                IsActive = isActive
            };
        }

        public async Task<object> StartNewSession(User user)
        {
            var today = DateTime.Today;
            var startOfDay = today;
            var endOfDay = today.AddDays(1).AddTicks(-1);

            var activeSession = await _context.TimeSessions
                .FirstOrDefaultAsync(s => s.UserId == user.Id && s.EndTime == null);

            if (activeSession != null)
            {
                throw new InvalidOperationException("Sesja jeż już aktywna.");
            }

            var existingSession = await _context.TimeSessions
                .Where(s => s.UserId == user.Id && s.StartTime >= startOfDay && s.StartTime <= endOfDay)
                .OrderBy(s => s.StartTime)
                .FirstOrDefaultAsync();

            var now = DateTime.Now;
            var newSession = new TimeSession
            {
                UserId = user.Id,
                StartTime = now,
                CreatedAt = now,
                UpdatedAt = now
            };

            _context.TimeSessions.Add(newSession);
            await _context.SaveChangesAsync();

            var startTime = existingSession?.StartTime.ToString("HH:mm:ss") ?? newSession.StartTime.ToString("HH:mm:ss");
            var countTime = CalculateCountTime(user);

            return new
            {
                start_time = startTime,
                count_time = countTime,
                is_active = true
            };
        }

        public async Task<object> StopSession(User user)
        {
            var activeSession = await _context.TimeSessions
                .Where(s => s.UserId == user.Id && s.EndTime == null)
                .OrderByDescending(s => s.StartTime)
                .FirstOrDefaultAsync();

            if (activeSession == null)
            {
                throw new InvalidOperationException("Nie znaleziono aktywnej sesji");
            }

            var endTime = DateTime.Now;
            var duration = endTime - activeSession.StartTime;

            activeSession.EndTime = endTime;
            activeSession.ElapsedTime = duration;
            activeSession.UpdatedAt = endTime;

            await _context.SaveChangesAsync();

            var fullElapsedSeconds = CalculateCountTime(user);
            activeSession.FullElapsedTime = TimeSpan.FromSeconds(fullElapsedSeconds);

            await _context.SaveChangesAsync();

            return new
            {
                end_time = activeSession.EndTime?.ToString("HH:mm:ss"),
                elapsed_time = FormatDuration(fullElapsedSeconds)
            };
        }

        public int CalculateCountTime(User user)
        {
            var today = DateTime.Today;
            var startOfDay = today;
            var endOfDay = today.AddDays(1).AddTicks(-1);

            var sessions = _context.TimeSessions
                .Where(s => s.UserId == user.Id && s.StartTime >= startOfDay && s.StartTime <= endOfDay)
                .OrderBy(s => s.StartTime)
                .ToList();

            int totalSeconds = 0;
            foreach (var session in sessions)
            {
                if (session.ElapsedTime.HasValue)
                {
                    totalSeconds += (int)session.ElapsedTime.Value.TotalSeconds;
                }
                else if (!session.EndTime.HasValue)
                {
                    var duration = DateTime.Now - session.StartTime;
                    totalSeconds += (int)duration.TotalSeconds;
                }
            }

            return totalSeconds;
        }

        public string FormatDuration(int seconds)
        {
            var timeSpan = TimeSpan.FromSeconds(seconds);
            return $"{timeSpan.Hours:D2}:{timeSpan.Minutes:D2}:{timeSpan.Seconds:D2}";
        }
    }
}