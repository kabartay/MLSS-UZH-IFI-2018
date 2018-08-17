from pydriller import *
from datetime import *

starting_commit = 'a798745eefd8ba6c499a664f3005bf872abe1f0c'
# July 1, 2017 at 18:07:01 GMT+2

now_commit = '38e149f626bc7722922f87989fb9776d4fe325e9'

gr = GitRepository(path=path)
gr.checkout(starting_commit)

files = {f: {'contribs':Counter(), 'bugs': 0} for f in gr.files() if f.endswith('java')}

gr.checkout(now_commit)


# let's find ownership information in the previous year
dt1 = datetime(2016, 7, 1, 18, 0, 0)
dt2 = datetime(2017, 6, 15, 18, 0, 0)

for commit in RepositoryMining(path, since=dt1, to=dt2).traverse_commits():
  for modification in commit.modifications:
    if (modification.new_path):
      name = path + modification.new_path
      if name in files:
        files[name]['contribs'][commit.author.name] += 1

  
# let's find defects in the following six months
dt1 = datetime(2017, 6, 16, 18, 0, 0)
dt2 = datetime(2018, 1, 15, 18, 0, 0)

bug_keywords = ['bug', 'fix', 'error']

for commit in RepositoryMining(path, since=dt1, to=dt2).traverse_commits():
  if any(word in commit.msg for word in bug_keywords):
    for modification in commit.modifications:
      if (modification.new_path):
        name = path + modification.new_path
        if name in files:
          files[name]['bugs'] += 1


# let's write the output to CSV
import csv

with open('results.csv', 'w') as csvfile:
    fieldnames = ['filename', 'total', 'major', 'minor', 'own', 'bugs']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()

    for filename, data in files.items():
      f = data['contribs']
      total = len(list(f))
      commits = sum(f.values())
      threshold = commits * 0.05
      minor = len([k for k,v in f.most_common() if v <= threshold])
      major = len([k for k,v in f.most_common() if v > threshold])
      own = 0
      if f.most_common(1):
        own = f.most_common(1)[0][1] / commits
      writer.writerow({'filename': filename,
                       'total': total,
                       'major': major,
                       'minor': minor,
                       'own': own,
                       'bugs': data['bugs']})

