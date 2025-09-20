using System.ComponentModel.DataAnnotations;

namespace RecruitmentSystem.Api.Models
{
    public class Document
    {
        public int Id { get; set; }
        
        [Required]
        public int CandidateId { get; set; } // Foreign Key to Candidates
        
        [Required]
        [StringLength(100)]
        public string DocumentType { get; set; } = string.Empty;
        
        [Required]
        public string FilePath { get; set; } = string.Empty;
        
        public bool Verified { get; set; } = false;
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? VerifiedAt { get; set; }
        
        public int? VerifiedBy { get; set; } // Foreign Key to Users (HR)
        
        // Navigation properties
        public Candidate? Candidate { get; set; }
        public User? VerifiedByUser { get; set; }
    }
}
