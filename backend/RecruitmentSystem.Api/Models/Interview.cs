using System.ComponentModel.DataAnnotations;

namespace RecruitmentSystem.Api.Models
{
    public class Interview
    {
        public int Id { get; set; }
        
        [Required]
        public int CandidateId { get; set; } // Foreign Key to Candidates
        
        [Required]
        public int JobId { get; set; } // Foreign Key to Jobs
        
        [Required]
        public DateTime ScheduledDate { get; set; }
        
        [Required]
        [StringLength(50)]
        public string InterviewType { get; set; } = string.Empty; // Technical, HR, Panel, Online Test
        
        [Required]
        public int RoundNo { get; set; }
        
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Scheduled"; // Scheduled, Other Interview, Selected, Rejected, Cancelled
        
        public DateTime? CompletedAt { get; set; }
        
        // Navigation properties
        public Candidate? Candidate { get; set; }
        public Job? Job { get; set; }
        public ICollection<Interviewer> Interviewers { get; set; } = new List<Interviewer>();
        public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
    }
}
