namespace RecruitmentSystem.Api.Models
{
    public class DashboardStatsDto
    {
        public int TotalJobs { get; set; }
        public int OpenJobs { get; set; }
        public int OnHoldJobs { get; set; }
        public int ClosedJobs { get; set; }
        public int TotalCandidates { get; set; }
        public int AppliedCandidates { get; set; }
        public int ShortlistedCandidates { get; set; }
        public int InterviewCandidates { get; set; }
        public int SelectedCandidates { get; set; }
        public int RejectedCandidates { get; set; }
        public int OnHoldCandidates { get; set; }
        public int TotalInterviews { get; set; }
        public int ScheduledInterviews { get; set; }
        public int CompletedInterviews { get; set; }
        public int PendingInterviews { get; set; }
        public int TotalOffers { get; set; }
        public int PendingOffers { get; set; }
        public int AcceptedOffers { get; set; }
        public int RejectedOffers { get; set; }
    }

    public class RecentJobDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public int MinExperience { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public int AppliedCount { get; set; }
    }

    public class RecentCandidateDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int ExperienceYears { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        public List<string> Skills { get; set; } = new List<string>();
    }

    public class UpcomingInterviewDto
    {
        public int Id { get; set; }
        public string CandidateName { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string InterviewType { get; set; } = string.Empty;
        public int RoundNo { get; set; }
        public DateTime ScheduledDate { get; set; }
        public List<string> Interviewers { get; set; } = new List<string>();
    }

    public class PendingTaskDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty; // Interview, Review, Approval, etc.
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
        public string Priority { get; set; } = string.Empty; // High, Medium, Low
        public string AssignedTo { get; set; } = string.Empty;
    }

    public class NotificationDto
    {
        public int Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}
