using System.ComponentModel.DataAnnotations;

namespace RecruitmentSystem.Api.Models
{
    public class Feedback
    {
        public int Id { get; set; }
        
        [Required]
        public int InterviewId { get; set; } // Foreign Key to Interviews
        
        [Required]
        public int InterviewerId { get; set; } // Foreign Key to Users
        
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }
        
        public string? Comments { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public Interview? Interview { get; set; }
        public User? Interviewer { get; set; }
    }
}
