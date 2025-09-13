using RecruitmentSystem.Api.Models;

namespace RecruitmentSystem.Api.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(int id);
        Task<User> CreateAsync(User user);
        Task<User> UpdateAsync(User user);
        Task<bool> ExistsByUsernameAsync(string username);
        Task<bool> ExistsByEmailAsync(string email);
    }
}
