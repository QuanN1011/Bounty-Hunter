# get level
def get_level(total_bounty):
    if total_bounty >= 10000:
        return "Emperor"

    elif total_bounty >= 4000:
        return "Warlord"

    elif total_bounty >= 1500:
        return "Worst Generation"

    elif total_bounty >= 500:
        return "Pirate"

    else:
        return "Rookie"
    
# get progress for progress bar
def get_progress(total_bounty):

    levels = [0, 500, 1500, 4000, 10000]

    for i in range(len(levels) - 1):

        if total_bounty < levels[i+1]:

            current = levels[i]
            next_level = levels[i+1]

            progress = (total_bounty - current) / (next_level - current)

            return int(progress * 100)

    return 100

# function to reward harder tasks

def calculate_rewards(base_reward, difficulty):
    if difficulty == "Hard":
        return int(base_reward * 2)
    elif difficulty == "Medium":
        return int(base_reward * 1.5)
    else:
        return base_reward