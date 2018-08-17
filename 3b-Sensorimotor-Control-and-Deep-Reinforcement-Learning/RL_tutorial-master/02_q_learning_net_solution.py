# Based on code from https://medium.com/emergent-future/simple-reinforcement-learning-with-tensorflow-part-0-q-learning-with-tables-and-neural-networks-d195264329d0

import gym
import numpy as np
import time
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim

import util.eval


class SimpleLinearNet(nn.Module):
    def __init__(self, n_input, lr):
        super(SimpleLinearNet, self).__init__()
        self.n_input = n_input
        self.lr = lr
        self.w = torch.rand([n_input,4], requires_grad=True)
        self.w.data = torch.rand([env.observation_space.n,4], requires_grad=False).data*0.01


    def forward(self, x):
        return x.mm(self.w)

    def update(self, loss, lr):
        loss.backward()
        with torch.no_grad():
            self.w -= self.lr * self.w.grad
            self.w.grad.zero_()


class FancyLinearNet(nn.Module):
    def __init__(self, n_input, lr):
        super(FancyLinearNet, self).__init__()
        self.n_input = n_input
        self.lr = lr
        self.fc_out = nn.Linear(n_input, 4, bias=False)
        torch.nn.init.uniform_(self.fc_out.weight, 0., 0.0)
        self.optimizer = optim.SGD(self.parameters(), lr=lr)

    def forward(self, x):
        x = self.fc_out(x)
        return x

    def update(self, loss):
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

class DeepNet(nn.Module):
    def __init__(self, n_input, lr):
        super(DeepNet, self).__init__()
        self.n_input = n_input
        self.lr = lr
        self.fc_h1 = nn.Linear(n_input, 16, bias=False)
        torch.nn.init.uniform_(self.fc_h1.weight, 0., 0.1)
        # torch.nn.init.uniform_(self.fc_h1.bias, 0., 0.01)
        self.fc_out = nn.Linear(16, 4, bias=False)
        torch.nn.init.uniform_(self.fc_out.weight, 0., 0.01)
        self.optimizer = optim.SGD(self.parameters(), lr=lr)

    def forward(self, x):
        x = F.relu(self.fc_h1(x))
        x = self.fc_out(x)
        return x

    def update(self, loss):
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

def int_to_onehot(x, dim):
    x_onehot = torch.zeros([1, dim])
    x_onehot[0,x] = 1.
    return x_onehot #+ torch.randn([1, dim])*0.05


env = gym.make('FrozenLake-v0')
# env = gym.make('FrozenLake8x8-v0')
t0 = time.time()

# Set learning parameters
lr = .4
gamma = .95
net = FancyLinearNet(env.observation_space.n, lr)
num_episodes = 2000
returns_list = []
for episode in range(num_episodes):
    #Reset environment and get first new observation
    obs = env.reset()
    cumulative_reward = 0
    terminal = False
    step = 0
    #The Q-Table learning algorithm
    while step < 99:
        step+=1
        #Choose an action by greedily (with noise) picking from Q table
        obs_onehot = int_to_onehot(obs, env.observation_space.n)
        pred = net(obs_onehot)

        # if np.random.rand() < 50./(float(i)+500.):
        #     a = env.action_space.sample()
        # else:
        #     # a = np.argmax(net(s_torch).detach().numpy() + np.random.randn(1,env.action_space.n)*(1./(i+1)))
        #     a = np.argmax(pred.detach().numpy())
        act = np.argmax(pred.detach().numpy() + np.random.randn(1,env.action_space.n)*(1./(episode+1)))
        #Get new state and reward from environment
        obs_new, reward, terminal,_ = env.step(act)
        obs_new_onehot = int_to_onehot(obs_new, env.observation_space.n)
        # Update the Q-function
        output = pred[:,act]
        pred_new = torch.Tensor(net(obs_new_onehot).data)
        max_q_new = torch.max(pred_new, dim=1)[0]
        target = reward + gamma*max_q_new
        loss = (output - target).pow(2).sum()
        net.update(loss)

        cumulative_reward += reward
        obs = obs_new
        if terminal == True:
            # s_prepr = preprocess(s, env.observation_space.n)
            # output = net(s_prepr)
            # target = 0.
            # loss = (output - target).pow(2).sum()
            # net.update(loss)
            break
    #jList.append(j)
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
