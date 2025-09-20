using System.ComponentModel.DataAnnotations;

namespace RecruitmentSystem.Api.Models
{
    public class Offer
    {
        public int Id { get; set; }
        
        [Required]
        public int CandidateId { get; set; } // Foreign Key to Candidates
        
        [Required]
        public int JobId { get; set; } // Foreign Key to Jobs
        
        [Required]
        public DateTime OfferDate { get; set; } = DateTime.UtcNow;
        
        public DateTime? JoiningDate { get; set; }
        
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Offered"; // Offered, Accepted, Rejected, Joined
        
        public DateTime? StatusUpdatedAt { get; set; }
        
        // Navigation properties
        public Candidate? Candidate { get; set; }
        public Job? Job { get; set; }
    }
}
