namespace RecruitmentSystem.Api.Models
{
    public class JobSkill
    {
        public int JobId { get; set; }
        public int SkillId { get; set; }
        
        // Navigation properties
        public Job? Job { get; set; }
        public Skill? Skill { get; set; }
    }
}
