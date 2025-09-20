namespace RecruitmentSystem.Api.Models
{
    public class CandidateSkill
    {
        public int CandidateId { get; set; }
        public int SkillId { get; set; }
        public int ExperienceYears { get; set; }
        
        // Navigation properties
        public Candidate? Candidate { get; set; }
        public Skill? Skill { get; set; }
    }
}
