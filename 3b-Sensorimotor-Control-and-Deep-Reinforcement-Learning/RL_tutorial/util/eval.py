import time


def eval_agent(policy, env, num_episodes=1000, max_steps_per_episode=100):
    t0 = time.time()
    returns_list = []
    for episode in range(num_episodes):
        # Reset environment and get first new observation
        obs = env.reset()
        cumulative_reward = 0
        terminal = False
        step = 0
        while step < max_steps_per_episode:
            step += 1
            act = policy(obs)
            obs, reward, terminal, _ = env.step(act)
            cumulative_reward += reward
            if terminal == True:
                break
            if time.time() - t0 > 1:
                print('Eval episode %d/%d' % (episode,num_episodes))
                t0 = time.time()
        returns_list.append(cumulative_reward)
    return sum(returns_list)/num_episodes
