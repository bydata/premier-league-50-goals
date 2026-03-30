library(tidyverse)

df <- read_csv(file.path("data", "pl-50-goals-progressions.csv"))

selected_players <- c(
  "Erling Haaland", "Andy Cole", "Alan Shearer", 
  "Mohamed Salah", "Harry Kane")

df_long <- df |> 
  rename(matches_played = `Matches played`) |> 
  pivot_longer(
    cols = -c(matches_played),
    names_to = "player", values_to = "cumul_goals") |> 
  arrange(player, matches_played) |> 
  mutate(goals = cumul_goals - lag(cumul_goals, n = 1, default = 0),
    .by = player) |> 
  filter(player %in% selected_players) |> 
  mutate(player = factor(player, levels = selected_players))


# Overlapping dots
df_long |> 
  filter(!is.na(goals) & goals > 0) |> 
  ggplot(aes(matches_played, y = 1)) +
  geom_hline(yintercept = 1, linewidth = 0.1) +
  geom_point(
    aes(size = goals),
    shape = 21, col = "red", fill = alpha("red", 0.1)) +
  scale_size_area(max_size = 8) +
  facet_wrap(vars(player), ncol = 1) +
  labs(x = "Matches played \U2192") +
  theme_void() +
  theme(
    strip.text = element_text(hjust = 0),
    axis.title.x = element_text(),
    plot.margin = margin(t = 4, r = 4, b = 4, l = 4)
  )
ggsave(file.path("drafts", "plots", "goal-progressions-overlapping-dots.png"),
  width = 5, height = 5)


# Heatmap-like
df_long |> 
  filter(!is.na(goals)) |> 
  ggplot(aes(matches_played, y = 1)) +
  geom_point(
    shape = 22, col = "red"
  ) +
  geom_point(
    aes(alpha = goals),
    shape = 22, col = "transparent", fill = "red") +
  scale_alpha_continuous(range = c(0, 1)) +
  facet_wrap(vars(player), ncol = 1) +
  labs(x = "Matches played \U2192") +
  theme_void() +
  theme(
    strip.text = element_text(hjust = 0),
    axis.title.x = element_text(),
    plot.margin = margin(t = 4, r = 4, b = 4, l = 4)
  )
ggsave(file.path("drafts", "plots", "goal-progressions-filled-squares.png"),
  width = 5, height = 5)
  
