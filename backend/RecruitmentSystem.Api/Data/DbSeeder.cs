using Microsoft.EntityFrameworkCore;
using RecruitmentSystem.Api.Models;
using System.Text.Json;

namespace RecruitmentSystem.Api.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            // Check if admin user already exists
            var adminExists = await context.Users.AnyAsync(u => u.Username == "admin");
            
            if (!adminExists)
            {
                // Create admin user
                var adminUser = new User
                {
                    FullName = "System Administrator",
                    Email = "admin@recruitmentsystem.com",
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Roles = JsonSerializer.Serialize(new List<string> { "Admin" }),
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };

                // Create HR user
                var hrUser = new User
                {
                    FullName = "HR Manager",
                    Email = "hr@recruitment.com",
                    Username = "hr",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("hr123"),
                    Roles = JsonSerializer.Serialize(new List<string> { "HR" }),
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };

                // Create Recruiter user
                var recruiterUser = new User
                {
                    FullName = "Senior Recruiter",
                    Email = "recruiter@recruitment.com",
                    Username = "recruiter",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("recruiter123"),
                    Roles = JsonSerializer.Serialize(new List<string> { "Recruiter" }),
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };

                // Create Interviewer user
                var interviewerUser = new User
                {
                    FullName = "Technical Interviewer",
                    Email = "interviewer@recruitment.com",
                    Username = "interviewer",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("interviewer123"),
                    Roles = JsonSerializer.Serialize(new List<string> { "Interviewer" }),
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };

                // Create Reviewer user
                var reviewerUser = new User
                {
                    FullName = "CV Reviewer",
                    Email = "reviewer@recruitment.com",
                    Username = "reviewer",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("reviewer123"),
                    Roles = JsonSerializer.Serialize(new List<string> { "Reviewer" }),
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };

                // Create Candidate user
                var candidateUser = new User
                {
                    FullName = "John Doe",
                    Email = "candidate@recruitment.com",
                    Username = "candidate",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("candidate123"),
                    Roles = JsonSerializer.Serialize(new List<string> { "Candidate" }),
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };

                context.Users.AddRange(adminUser, hrUser, recruiterUser, interviewerUser, reviewerUser, candidateUser);
                await context.SaveChangesAsync();

                // Create skills
                var skills = new[]
                {
                    new Skill { Name = "C#" },
                    new Skill { Name = "JavaScript" },
                    new Skill { Name = "React" },
                    new Skill { Name = "Node.js" },
                    new Skill { Name = "SQL" },
                    new Skill { Name = "Azure" },
                    new Skill { Name = "Docker" },
                    new Skill { Name = "Git" },
                    new Skill { Name = "Agile" },
                    new Skill { Name = "Communication" }
                };

                context.Skills.AddRange(skills);
                await context.SaveChangesAsync();

                // Create jobs
                var jobs = new[]
                {
                    new Job
                    {
                        Title = "Senior Software Engineer",
                        Department = "Engineering",
                        Description = "We are looking for a senior software engineer with 5+ years of experience in C# and React.",
                        MinExperience = "5 years",
                        Location = "New York, NY",
                        Status = JobStatus.Open,
                        CreatedBy = recruiterUser.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-10)
                    },
                    new Job
                    {
                        Title = "Full Stack Developer",
                        Department = "Engineering",
                        Description = "Full stack developer position with experience in JavaScript, Node.js, and React.",
                        MinExperience = "3 years",
                        Location = "San Francisco, CA",
                        Status = JobStatus.Open,
                        CreatedBy = recruiterUser.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-5)
                    },
                    new Job
                    {
                        Title = "DevOps Engineer",
                        Department = "Operations",
                        Description = "DevOps engineer with experience in Azure, Docker, and CI/CD pipelines.",
                        MinExperience = "4 years",
                        Location = "Seattle, WA",
                        Status = JobStatus.OnHold,
                        CreatedBy = recruiterUser.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-3)
                    }
                };

                context.Jobs.AddRange(jobs);
                await context.SaveChangesAsync();

                // Create candidate
                var candidate = new Candidate
                {
                    UserId = candidateUser.Id,
                    ExperienceYears = 4,
                    Status = "Applied",
                    CreatedAt = DateTime.UtcNow.AddDays(-2)
                };

                context.Candidates.Add(candidate);
                await context.SaveChangesAsync();

                // Create candidate skills
                var candidateSkills = new[]
                {
                    new CandidateSkill { CandidateId = candidate.Id, SkillId = skills[0].Id, ExperienceYears = 4 }, // C#
                    new CandidateSkill { CandidateId = candidate.Id, SkillId = skills[1].Id, ExperienceYears = 3 }, // JavaScript
                    new CandidateSkill { CandidateId = candidate.Id, SkillId = skills[2].Id, ExperienceYears = 2 }, // React
                    new CandidateSkill { CandidateId = candidate.Id, SkillId = skills[4].Id, ExperienceYears = 4 }, // SQL
                    new CandidateSkill { CandidateId = candidate.Id, SkillId = skills[7].Id, ExperienceYears = 5 }  // Git
                };

                context.CandidateSkills.AddRange(candidateSkills);
                await context.SaveChangesAsync();

                // Create candidate job applications
                var candidateJobs = new[]
                {
                    new CandidateJob
                    {
                        CandidateId = candidate.Id,
                        JobId = jobs[0].Id,
                        AppliedDate = DateTime.UtcNow.AddDays(-1)
                    },
                    new CandidateJob
                    {
                        CandidateId = candidate.Id,
                        JobId = jobs[1].Id,
                        AppliedDate = DateTime.UtcNow.AddDays(-1)
                    }
                };

                context.CandidateJobs.AddRange(candidateJobs);
                await context.SaveChangesAsync();

                // Create job skills
                var jobSkills = new[]
                {
                    new JobSkill { JobId = jobs[0].Id, SkillId = skills[0].Id }, // C#
                    new JobSkill { JobId = jobs[0].Id, SkillId = skills[2].Id }, // React
                    new JobSkill { JobId = jobs[0].Id, SkillId = skills[4].Id }, // SQL
                    new JobSkill { JobId = jobs[1].Id, SkillId = skills[1].Id }, // JavaScript
                    new JobSkill { JobId = jobs[1].Id, SkillId = skills[2].Id }, // React
                    new JobSkill { JobId = jobs[1].Id, SkillId = skills[3].Id }, // Node.js
                    new JobSkill { JobId = jobs[2].Id, SkillId = skills[5].Id }, // Azure
                    new JobSkill { JobId = jobs[2].Id, SkillId = skills[6].Id }, // Docker
                };

                context.JobSkills.AddRange(jobSkills);
                await context.SaveChangesAsync();

                // Create interviews
                var interviews = new[]
                {
                    new Interview
                    {
                        CandidateId = candidate.Id,
                        JobId = jobs[0].Id,
                        ScheduledDate = DateTime.UtcNow.AddDays(2),
                        InterviewType = "Technical",
                        RoundNo = 1,
                        Status = "Scheduled"
                    },
                    new Interview
                    {
                        CandidateId = candidate.Id,
                        JobId = jobs[1].Id,
                        ScheduledDate = DateTime.UtcNow.AddDays(3),
                        InterviewType = "HR",
                        RoundNo = 1,
                        Status = "Scheduled"
                    }
                };

                context.Interviews.AddRange(interviews);
                await context.SaveChangesAsync();

                // Create interviewers
                var interviewers = new[]
                {
                    new Interviewer { InterviewId = interviews[0].Id, UserId = interviewerUser.Id },
                    new Interviewer { InterviewId = interviews[1].Id, UserId = hrUser.Id }
                };

                context.Interviewers.AddRange(interviewers);
                await context.SaveChangesAsync();

                // Create notifications
                var notifications = new[]
                {
                    new Notification
                    {
                        UserId = adminUser.Id,
                        Message = "New user registration pending approval",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow.AddHours(-2)
                    },
                    new Notification
                    {
                        UserId = hrUser.Id,
                        Message = "New candidate applied for Senior Software Engineer position",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow.AddHours(-1)
                    },
                    new Notification
                    {
                        UserId = interviewerUser.Id,
                        Message = "Interview scheduled for tomorrow at 2:00 PM",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow.AddMinutes(-30)
                    }
                };

                context.Notifications.AddRange(notifications);
                await context.SaveChangesAsync();

                Console.WriteLine("Database seeded successfully with sample data!");
            }
        }
    }
}
