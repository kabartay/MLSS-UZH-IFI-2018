# Based on code from https://medium.com/emergent-future/simple-reinforcement-learning-with-tensorflow-part-0-q-learning-with-tables-and-neural-networks-d195264329d0

import gym
import numpy as np
import time
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim

import util.eval


class ShallowNet(nn.Module):
    def __init__(self, n_input, lr):
        super(ShallowNet, self).__init__()
        self.n_input = n_input
        self.lr = lr
        self.fc_out = nn.Linear(n_input, 4, bias=False)
        torch.nn.init.uniform_(self.fc_out.weight, 0.0, 0.0)
        self.optimizer = optim.SGD(self.parameters(), lr=lr)

    def forward(self, x):
        x = self.fc_out(x)
        return x

def int_to_onehot(x, dim):
    x_onehot = torch.zeros([1, dim])
    x_onehot[0,x] = 1.
    return x_onehot


env = gym.make('FrozenLake-v0')
t0 = time.time()

# Set learning parameters
# TODO
lr = 0. # TODO again, might need to be higher than you are used to. How to set it to be equivalent to the tabular case?

gamma = 0.95
max_steps_per_episode = 99
num_episodes = 2000
# Initialize list of per-episode returns
returns_list = []
# Initialize the Q-network
net = ShallowNet(env.observation_space.n, lr)
for episode in range(num_episodes):
    #Reset environment and get first new observation
    obs = env.reset()
    cumulative_reward = 0
    terminal = False
    # Q-learning with function approximation
    for step in range(max_steps_per_episode):
        # feed the observation to the network and get a prediction
        obs_onehot = int_to_onehot(obs, env.observation_space.n)
        pred = net(obs_onehot)
        
        act = np.argmax(pred.detach().numpy() + np.random.randn(1,env.action_space.n)*(1./(episode+1)))

        # Get new observation and reward from the environment
        obs_new, reward, terminal,_ = env.step(act)
        # TODO 
        pred_new = torch.zeros((1,4)) # TODO Process the new observation with the net (same as above)

        # TODO Update the Q-function
        predicted = pred[0,0] # TODO This is the key point. Set to the current prediction
        target = torch.zeros((1,4)) # TODO This is the key point. Set to what Bellman equation suggest. Remember to stop gradients with .detach()
        loss = (predicted - target).pow(2).sum()
        net.optimizer.zero_grad()
        loss.backward()
        net.optimizer.step()

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
    obs_onehot = int_to_onehot(obs, env.observation_space.n)
    pred = net(obs_onehot)
    act = np.argmax(pred.detach().numpy())
    return act

avg_test_return = util.eval.eval_agent(policy, env, num_episodes=10000, max_steps_per_episode=100)
print("Avg eval return: ",  avg_test_return)
