# Based on code from https://medium.com/emergent-future/simple-reinforcement-learning-with-tensorflow-part-0-q-learning-with-tables-and-neural-networks-d195264329d0

import gym
import numpy as np
import time
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim

import util.eval

class DeepNet(nn.Module):
    def __init__(self, n_input, lr):
        super(DeepNet, self).__init__()
        self.n_input = n_input
        self.lr = lr
        self.fc_h1 = nn.Linear(n_input, 16, bias=False)
        torch.nn.init.uniform_(self.fc_h1.weight, 0., 0.1)
        self.fc_out = nn.Linear(16, 4, bias=False)
        torch.nn.init.uniform_(self.fc_out.weight, 0., 0.01)
        self.optimizer = optim.SGD(self.parameters(), lr=lr)

    def forward(self, x):
        x = F.relu(self.fc_h1(x))
        x = self.fc_out(x)
        return x

def int_to_onehot(x, dim):
    x_onehot = torch.zeros([1, dim])
    x_onehot[0,x] = 1.
    return x_onehot


env = gym.make('FrozenLake-v0')
t0 = time.time()

# TODO Set learning parameters
lr = 0. # TODO

gamma = 0.95
eps_schedule = lambda x: 500./(float(x)+2000.)
max_steps_per_episode = 99
num_episodes = 10000
returns_list = []
net = DeepNet(env.observation_space.n, lr)
for episode in range(num_episodes):
    # Prepared to save the episode history.
    # Rewards and terminals initialized to None because they are only available starting from the second step
    history = {'preds': [], 'rewards': [None], 'terminals': [None], 'acts': []}
    cumulative_reward = 0
    terminal = False
    obs = env.reset()
    # Collect the experiences over one episode
    for step in range(max_steps_per_episode):
        # Process the observation and run the network
        obs_onehot = int_to_onehot(obs, env.observation_space.n)
        pred = net(obs_onehot)

        # Update the history
        history['preds'].append(pred)
        if terminal == False:
            # Select an action and take a step
            if np.random.rand() < eps_schedule(episode):
                act = env.action_space.sample()
            else:
                act = np.argmax(pred.detach().numpy())
            obs, reward, terminal, _ = env.step(act)
            # Update the history
            history['rewards'].append(reward)
            history['terminals'].append(terminal)
            history['acts'].append(act)
            cumulative_reward += reward
        else:
            # We do not need the last action, so put None there
            history['acts'].append(None)
            break

    # Train Q-learning on the collected transitions
    net.optimizer.zero_grad()
    num_steps = len(history['preds'])
    # Process the episode, going from the end to the beginning
    for step in range(num_steps-1,-1,-1):
        # For the terminal states target should be 0
        if step == num_steps-1:
            target = 0. # TODO
        else:
            target = 0. #TODO

        # Train Q-function
        predicted = pred[0,0] # TODO
        loss = (predicted - target).pow(2).sum()
        # Accumulate the gradient
        loss.backward()

    # Apply the update
    net.optimizer.step()

    if time.time() - t0 > 1:
        num_rwrds = min(100,len(returns_list)-1)
        print('Episode', episode, 'Smoothed average return', sum(returns_list[-num_rwrds:])/num_rwrds)
        t0 = time.time()
    returns_list.append(cumulative_reward)

print("Smoothed training reward", np.mean(np.reshape(np.array(returns_list), [-1,250]), axis=1))

print('Evaluating the learned policy')
def policy(obs):
    obs_onehot = int_to_onehot(obs, env.observation_space.n)
    pred = net(obs_onehot)
    return np.argmax(pred.detach().numpy())

avg_test_return = util.eval.eval_agent(policy, env, num_episodes=10000, max_steps_per_episode=100)
print("Avg eval return: ",  avg_test_return)
