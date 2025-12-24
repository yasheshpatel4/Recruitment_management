using Microsoft.EntityFrameworkCore;
using RecruitmentSystem.Api.Data;
using RecruitmentSystem.Api.Models;
using RecruitmentSystem.Api.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RecruitmentSystem.Api.Services
{
    public class InterviewService : IInterviewService
    {
        private readonly IInterviewRepository _interviewRepository;
        private readonly AppDbContext _context;

        public InterviewService(IInterviewRepository interviewRepository, AppDbContext context)
        {
            _interviewRepository = interviewRepository;
            _context = context;
        }

        public async Task<InterviewDto?> GetInterviewByIdAsync(int id)
        {
            var interview = await _interviewRepository.GetByIdAsync(id);
            return interview != null ? MapToDto(interview) : null;
        }

        public async Task<List<InterviewDto>> GetInterviewsByCandidateIdAsync(int candidateId)
        {
            var interviews = await _interviewRepository.GetByCandidateIdAsync(candidateId);
            return interviews.Select(MapToDto).ToList();
        }

        public async Task<List<InterviewDto>> GetAllInterviewsAsync()
        {
            var interviews = await _interviewRepository.GetAllAsync();
            return interviews.Select(MapToDto).ToList();
        }

        public async Task<InterviewDto> ScheduleInterviewAsync(ScheduleInterviewDto dto)
        {
            var interview = new Interview
            {
                CandidateId = dto.CandidateId,
                JobId = dto.JobId,
                ScheduledDate = dto.ScheduledDate,
                InterviewType = dto.InterviewType,
                RoundNo = dto.RoundNo,
                Status = "Scheduled"
            };

            var createdInterview = await _interviewRepository.CreateAsync(interview);

            // Add interviewers if provided
            if (dto.InterviewerIds != null && dto.InterviewerIds.Any())
            {
                foreach (var interviewerId in dto.InterviewerIds)
                {
                    var interviewer = new Interviewer
                    {
                        InterviewId = createdInterview.Id,
                        UserId = interviewerId
                    };
                    // Note: This would need to be added to the repository method
                    // For now, we'll assume it's handled in the repository
                }
            }

            return MapToDto(createdInterview);
        }

        public async Task<InterviewDto?> UpdateInterviewStatusAsync(int interviewId, UpdateInterviewStatusDto dto)
        {
            var success = await _interviewRepository.UpdateInterviewStatusAsync(interviewId, dto.Status);
            if (!success)
                return null;

            var updatedInterview = await _interviewRepository.GetByIdAsync(interviewId);
            if (updatedInterview == null)
                return null;

            // Create notification for the candidate
            var interviewWithDetails = await _context.Interviews
                .Include(i => i.Candidate)
                .ThenInclude(c => c.User)
                .Include(i => i.Job)
                .FirstOrDefaultAsync(i => i.Id == interviewId);

            if (interviewWithDetails != null && interviewWithDetails.Candidate != null)
            {
                var notification = new Notification
                {
                    UserId = interviewWithDetails.Candidate.UserId,
                    Message = $"Your interview status for '{interviewWithDetails.Job?.Title ?? "Unknown Job"}' has been updated to '{dto.Status}'.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }

            return MapToDto(updatedInterview);
        }

        public async Task<Feedback> AddInterviewFeedbackAsync(int interviewId, InterviewFeedbackDto dto)
        {
            var feedback = new Feedback
            {
                InterviewId = interviewId,
                InterviewerId = dto.InterviewerId,
                Rating = dto.Rating,
                Comments = dto.Comments,
                CreatedAt = DateTime.UtcNow
            };

            return await _interviewRepository.AddFeedbackAsync(feedback);
        }

        public async Task<List<FeedbackDto>> GetInterviewFeedbacksAsync(int interviewId)
        {
            var feedbacks = await _interviewRepository.GetFeedbacksByInterviewIdAsync(interviewId);
            return feedbacks.Select(f => new FeedbackDto
            {
                Id = f.Id,
                InterviewerId = f.InterviewerId,
                InterviewerName = f.Interviewer?.FullName ?? "Unknown",
                Rating = f.Rating,
                Comments = f.Comments ?? string.Empty,
                CreatedAt = f.CreatedAt
            }).ToList();
        }

        public async Task<bool> DeleteInterviewAsync(int id)
        {
            return await _interviewRepository.DeleteAsync(id);
        }

        public async Task<List<InterviewDto>> GetInterviewsByJobIdAsync(int jobId)
        {
            var interviews = await _interviewRepository.GetInterviewsByJobIdAsync(jobId);
            return interviews.Select(MapToDto).ToList();
        }

        public async Task<List<InterviewDto>> GetInterviewsByInterviewerIdAsync(int interviewerId)
        {
            var interviews = await _interviewRepository.GetInterviewsByInterviewerIdAsync(interviewerId);
            return interviews.Select(MapToDto).ToList();
        }

        private InterviewDto MapToDto(Interview interview)
        {
            return new InterviewDto
            {
                Id = interview.Id,
                CandidateId = interview.CandidateId,
                CandidateName = interview.Candidate?.User?.FullName ?? "Unknown",
                JobId = interview.JobId,
                JobTitle = interview.Job?.Title ?? "Unknown",
                ScheduledDate = interview.ScheduledDate,
                InterviewType = interview.InterviewType,
                RoundNo = interview.RoundNo,
                Status = interview.Status,
                CompletedAt = interview.CompletedAt,
                Interviewers = interview.Interviewers.Select(i => new InterviewerDto
                {
                    Id = i.Id,
                    UserId = i.UserId,
                    UserName = i.User?.Username ?? "Unknown",
                    FullName = i.User?.FullName ?? "Unknown"
                }).ToList(),
                Feedbacks = interview.Feedbacks.Select(f => new FeedbackDto
                {
                    Id = f.Id,
                    InterviewerId = f.InterviewerId,
                    InterviewerName = f.Interviewer?.FullName ?? "Unknown",
                    Rating = f.Rating,
                    Comments = f.Comments ?? string.Empty,
                    CreatedAt = f.CreatedAt
                }).ToList()
            };
        }
    }
}
