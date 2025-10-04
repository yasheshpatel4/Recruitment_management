using System.ComponentModel.DataAnnotations;

namespace RecruitmentSystem.Api.Models
{
    public class Job
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Department { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string MinExperience { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Location { get; set; } = string.Empty;

        [Required]
        public JobStatus Status { get; set; } = JobStatus.Open;

        [Required]
        public int CreatedBy { get; set; } // Foreign Key to Users

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public string? ClosedReason { get; set; }

        public int? SelectedCandidateId { get; set; } // Foreign Key to Candidates

        // Navigation properties
        public User? CreatedByUser { get; set; }
        public ICollection<JobSkill> JobSkills { get; set; } = new List<JobSkill>();
        public ICollection<CandidateJob> CandidateJobs { get; set; } = new List<CandidateJob>();
        public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
    }
}
