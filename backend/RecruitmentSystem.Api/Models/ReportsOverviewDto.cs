namespace RecruitmentSystem.Api.Models
{
    public class ReportsOverviewDto
    {
        public int TotalApplications { get; set; }
        public decimal InterviewRate { get; set; }
        public decimal HireRate { get; set; }
        public decimal TimeToHire { get; set; }
        public List<SourceAnalysisDto> SourceAnalysis { get; set; } = new List<SourceAnalysisDto>();
        public List<RecentActivityDto> RecentActivity { get; set; } = new List<RecentActivityDto>();
    }

    public class SourceAnalysisDto
    {
        public string Source { get; set; }
        public decimal Percentage { get; set; }
    }

    public class RecentActivityDto
    {
        public string Type { get; set; } // "application", "interview", "shortlist", etc.
        public string Description { get; set; }
        public string TimeAgo { get; set; }
    }

    public class CandidateStatusDto
    {
        public string Status { get; set; }
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }

    public class JobDepartmentDto
    {
        public string Department { get; set; }
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }

    public class InterviewTrendDto
    {
        public string Month { get; set; }
        public int Count { get; set; }
        public int Year { get; set; }
    }
}
