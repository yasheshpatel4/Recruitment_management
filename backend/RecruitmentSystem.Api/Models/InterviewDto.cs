using System.ComponentModel.DataAnnotations;

namespace RecruitmentSystem.Api.Models
{
    public class InterviewDto
    {
        public int Id { get; set; }
        public int CandidateId { get; set; }
        public string CandidateName { get; set; } = string.Empty;
        public int JobId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
        public string InterviewType { get; set; } = string.Empty;
        public int RoundNo { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? CompletedAt { get; set; }
        public List<InterviewerDto> Interviewers { get; set; } = new List<InterviewerDto>();
        public List<FeedbackDto> Feedbacks { get; set; } = new List<FeedbackDto>();
    }

    public class InterviewerDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }

    public class FeedbackDto
    {
        public int Id { get; set; }
        public int InterviewerId { get; set; }
        public string InterviewerName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comments { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
