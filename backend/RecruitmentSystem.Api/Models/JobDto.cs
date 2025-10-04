
using System.ComponentModel.DataAnnotations;

namespace RecruitmentSystem.Api.Models
{
    public class CreateJobDto
    {
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
        public List<JobSkillDto> Skills { get; set; } = new List<JobSkillDto>(); // Required skills
    }

    public class UpdateJobDto
    {
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
        public List<int> SkillIds { get; set; } = new List<int>();

        [Required]
        public JobStatus Status { get; set; } = JobStatus.Open;

        public string? ClosedReason { get; set; }

        public int? SelectedCandidateId { get; set; }
    }

    public class JobDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string MinExperience { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public JobStatus Status { get; set; } = JobStatus.Open;
        public int CreatedBy { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? ClosedReason { get; set; }
        public int? SelectedCandidateId { get; set; }
        public List<SkillDto> Skills { get; set; } = new List<SkillDto>();
    }

    public class JobSkillDto
    {
        public int SkillId { get; set; }
    }

    public class SkillDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
