# Based on code from https://medium.com/emergent-future/simple-reinforcement-learning-with-tensorflow-part-0-q-learning-with-tables-and-neural-networks-d195264329d0

import gym
import numpy as np
import time
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim

import util.eval

class SoftmaxNet(nn.Module):
    def __init__(self, n_input, lr):
        super(SoftmaxNet, self).__init__()
        self.n_input = n_input
        self.lr = lr
        self.fc_h1 = nn.Linear(n_input, n_input, bias=False)
        torch.nn.init.uniform_(self.fc_h1.weight, 0., 0.1)
        self.policy_out = nn.Linear(n_input, 4, bias=False)
        torch.nn.init.uniform_(self.policy_out.weight, 0., 0.01)
        self.value_out = nn.Linear(n_input, 1, bias=False)
        torch.nn.init.uniform_(self.value_out.weight, 0., 0.01)
        self.softmax = nn.Softmax(dim=1)
        self.optimizer = optim.SGD(self.parameters(), lr=lr)

    def forward(self, x):
        x = F.leaky_relu(self.fc_h1(x), negative_slope=0.2)
        pol = self.policy_out(x)
        pol = self.softmax(pol)
        v = self.value_out(x)
        return pol, v

def int_to_onehot(x, dim):
    x_onehot = torch.zeros([1, dim])
    x_onehot[0,x] = 1.
    return x_onehot


env = gym.make('FrozenLake-v0')
t0 = time.time()

# Set learning parameters
lr = .05
gamma = .95
max_steps_per_episode = 99
num_episodes = 20000
returns_list = []
net = SoftmaxNet(env.observation_space.n, lr)
for episode in range(num_episodes):
    # Prepared to save the episode history.
    # Rewards and terminals initialized to None because they are only available starting from the second step
    history = {'pols': [], 'vals': [], 'rewards': [None], 'terminals': [None], 'acts': []}
    cumulative_reward = 0
    terminal = False
    obs = env.reset()
    # Collect the experiences over one episode
    for step in range(max_steps_per_episode):
        # Process the observation and run the network
        obs_onehot = int_to_onehot(obs, env.observation_space.n)
        pol, val = net(obs_onehot)

        # Update the history
        history['pols'].append(pol)
        history['vals'].append(val)
        if terminal == False:
            # Sample an action and take a step
            act = torch.multinomial(pol, 1).detach().numpy()[0,0]
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

    # Train policy gradient with baseline (a.k.a. actor-critic)
    net.optimizer.zero_grad()
    curr_return = 0.
    num_steps = len(history['vals'])
    # Process the episode, going from the end to the beginning
    for step in range(num_steps-1,-1,-1):
        pol, val, act, reward, terminal = history['pols'][step], history['vals'][step], \
                                          history['acts'][step], history['rewards'][step], \
                                          history['terminals'][step]
        # Compute the return from the current step to the end of the episode (there is no reward for the first step)
        if step>0:
            curr_return += reward
        # For the terminal states only train value
        if step == num_steps-1:
            if terminal:
                v_target = 0.
                train_policy = False
            else:
                break
        else:
            reward_next, val_next = history['rewards'][step+1], history['vals'][step+1]
            v_target = reward_next + gamma*val_next.detach()
            train_policy = True

        # Train value
        v_prediction = val
        v_loss = (v_prediction - v_target).pow(2).sum()
        # Accumulate the gradient
        v_loss.backward(retain_graph=True)

        # Train policy
        if train_policy:
            prob = pol[:,act]
            log_prob = torch.log(prob)
            advantage = curr_return - val.detach()
            p_loss = -(advantage*log_prob).sum() # + 0.01*(prob*log_prob).sum()
            # Accumulate gradient
            p_loss.backward()
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
    pol, _ = net(obs_onehot)
    return torch.multinomial(pol, 1).detach().numpy()[0,0]

avg_test_return = util.eval.eval_agent(policy, env, num_episodes=10000, max_steps_per_episode=100)
print("Avg eval return: ",  avg_test_return)
