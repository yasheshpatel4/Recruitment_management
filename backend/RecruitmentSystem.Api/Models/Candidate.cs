using System.ComponentModel.DataAnnotations;

namespace RecruitmentSystem.Api.Models
{
    public class Candidate
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; } // Foreign Key to Users
        
        public string? ResumePath { get; set; }
        
        [Required]
        public int ExperienceYears { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Applied"; // Applied, Shortlisted, Interview, Selected, Rejected, On Hold
        
        public int? UpdatedBy { get; set; } // Foreign Key to Users (HR/Recruiter/Admin/Reviewer)
        
        public DateTime? UpdatedAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public User? User { get; set; }
        public User? UpdatedByUser { get; set; }
        public ICollection<CandidateSkill> CandidateSkills { get; set; } = new List<CandidateSkill>();
        public ICollection<CandidateJob> CandidateJobs { get; set; } = new List<CandidateJob>();
        public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
        public ICollection<Document> Documents { get; set; } = new List<Document>();
        public ICollection<Offer> Offers { get; set; } = new List<Offer>();
    }
}
