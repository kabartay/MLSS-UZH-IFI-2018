# Based on code from https://medium.com/emergent-future/simple-reinforcement-learning-with-tensorflow-part-0-q-learning-with-tables-and-neural-networks-d195264329d0

import gym
import numpy as np
import time
import util.eval

env = gym.make('FrozenLake-v0')
t0 = time.time()

# Set learning parameters
# TODO
lr = 0. # TODO select an appropriate learning rate (hint: might be higher than you are used to)

gamma = 0.95
max_steps_per_episode = 99
num_episodes = 2000
# Initialize list of per-episode returns
returns_list = []
# Initialize the table with all zeros
Q = np.zeros([env.observation_space.n,env.action_space.n])
for episode in range(num_episodes):
    # Reset environment and get first new observation
    obs = env.reset()
    cumulative_reward = 0
    terminal = False
    # Tabular Q-learning
    for step in range(max_steps_per_episode):
        # Choose an action by greedily (with noise) picking from the Q table
        # TODO
        act = env.action_space.sample() # TODO One suggestion: add randn/(1+episode) to the Q-values
        # Get new state and reward from environment
        obs_new, reward, terminal, _ = env.step(act)
        # Update Q-Table with new knowledge
        # TODO
        Q[obs,act] = 0. # TODO Use the Bellman-equation-based update here
        cumulative_reward += reward
        obs = obs_new
        if terminal == True:
            break

    if time.time() - t0 > 1:
        num_rwrds = min(100,len(returns_list)-1)
        print('Episode', episode, 'Smoothed average return', sum(returns_list[-num_rwrds:])/num_rwrds)
        t0 = time.time()
    returns_list.append(cumulative_reward)

print("Smoothed training reward", np.mean(np.reshape(np.array(returns_list), [-1,250]), axis=1))

print('Evaluating the learned policy')
def policy(obs):
    # TODO
    return env.action_space.sample() # TODO This is the random policy. Replace it by the greedy policy according to the Q-table
avg_test_return = util.eval.eval_agent(policy, env, num_episodes=10000, max_steps_per_episode=100)
print("Avg eval return: ",  avg_test_return)

print("Final Q-Table Values")
print(Q)
