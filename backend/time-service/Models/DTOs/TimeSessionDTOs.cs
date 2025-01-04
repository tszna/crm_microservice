namespace time_service.Models.DTOs
{
    public class CurrentSessionOut
    {
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public string ElapsedTime { get; set; } = "00:00:00";
        public int CountTime { get; set; }
        public bool IsActive { get; set; }
    }

    public class DailySummary
    {
        public string Time { get; set; } = "-";
        public bool IsActive { get; set; }
    }

    public class UserSummary
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class WeeklySummaryResponse
    {
        public Dictionary<string, DailySummary> DailySummary { get; set; } = new();
        public string WeeklyTotal { get; set; } = "00:00:00";
        public int WeekOffset { get; set; }
        public List<UserSummary> Users { get; set; } = new();
        public long SelectedUserId { get; set; }
    }

    public class SessionResponse
    {
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public string? ElapsedTime { get; set; }
        public int CountTime { get; set; }
        public bool IsActive { get; set; }
    }
}