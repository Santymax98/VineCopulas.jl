const REPO = 'Santymax98/VineCopulas.jl'

export default {
  async load() {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${REPO}`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            ...(process.env.GITHUB_TOKEN
              ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
              : {}),
          },
        },
      )

      if (!response.ok) {
        throw new Error(
          `GitHub API returned ${response.status}: ${response.statusText}`,
        )
      }

      const repository = await response.json()
      return repository.stargazers_count ?? null
    } catch (error) {
      console.warn('Could not load GitHub star count:', error)
      return null
    }
  },
}