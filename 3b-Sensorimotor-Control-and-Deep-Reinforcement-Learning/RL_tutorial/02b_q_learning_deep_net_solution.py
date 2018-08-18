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
# env = gym.make('FrozenLake8x8-v0')
t0 = time.time()

# Set learning parameters
lr = .2
gamma = .95
eps_schedule = lambda x: 500./(float(x)+2000.)
max_steps_per_episode = 99
num_episodes = 10000
net = DeepNet(env.observation_space.n, lr)
returns_list = []
for episode in range(num_episodes):
    #Reset environment and get first new observation
    obs = env.reset()
    cumulative_reward = 0
    terminal = False
    terminate_episode = False
    # Q-learning with function approximation
    for step in range(max_steps_per_episode):
        # convert the action to a form the network can process
        obs_onehot = int_to_onehot(obs, env.observation_space.n)
        pred = net(obs_onehot)

        # Action selection with exploration using added noise
        # act = np.argmax(pred.detach().numpy() + np.random.randn(1,env.action_space.n)*(1./(episode+1)))
        # ALTERNATIVE: epsilon-greedy exploration
        if np.random.rand() < eps_schedule(episode):
            act = env.action_space.sample()
        else:
            act = np.argmax(pred.detach().numpy())

        # Preparing the target depends on the step being terminal or not
        if not terminal:
            # Get new observation and reward from the environment
            obs_new, reward, terminal,_ = env.step(act)
            # Process the new observation with the net
            obs_new_onehot = int_to_onehot(obs_new, env.observation_space.n)
            pred_new = net(obs_new_onehot).detach()

            # Prepare the target for the Q-function update
            max_q_new = torch.max(pred_new, dim=1)[0]
            target = reward + gamma*max_q_new

            # update the cumulative reward, prepare the observation for the next step
            cumulative_reward += reward
            obs = obs_new
        else:
            target=0.
            terminate_episode = True

        predicted = pred[:,act]
        loss = (predicted - target).pow(2).sum()
        net.optimizer.zero_grad()
        loss.backward()
        net.optimizer.step()

        if terminate_episode:
            break

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
