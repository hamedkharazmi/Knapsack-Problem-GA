from random import randint
from random import random as r
import time

number_of_population=0
number_of_generation=0
MAXweight=0
list_item=[]

class item:
  def __init__(self, weight, value):
    self.weight=weight
    self.value=value

def read_from_file():
  global number_of_population, number_of_generation, MAXweight, list_item
  reading_file = open("input2.txt",'r')
  number_of_population=int(reading_file.readline().split("=")[1])
  number_of_generation=int(reading_file.readline().split("=")[1])
  MAXweight=int(reading_file.readline().split("=")[1])
  item_lines=reading_file.readlines()
  for i in item_lines:
    itemTemp=item(int((i.split(",")[0]).split("(")[1]), int(i.split(",")[1].split(")")[0]))
    list_item.append(itemTemp)
  reading_file.close()

def fitnessFunction(chromosome):
  total_weights=0
  total_value=0
  for index,BineryVal in enumerate(chromosome):
    total_weights+=list_item[index].weight*BineryVal
    total_value+=list_item[index].value*BineryVal
  if total_weights > MAXweight:
    fit=0
  else:
    fit=total_value
  return fit

class individual:
  def __init__(self, chromosome=[]):
    self.chromosome=chromosome
    self.fitness=fitnessFunction(self.chromosome)

def initial_population():
  population=[]
  Non_zero=0
  while Non_zero!=number_of_population:
    chromosome=[]
    for j in range(len(list_item)):
      chromosome.append(randint(0,1))
    if fitnessFunction(chromosome):
      population.append(individual(chromosome))
      Non_zero+=1
  # for i in range(len(population)): 
  #   print(population[i].fitness)
  return population

def mutation(i):
  new_chromosome=i.chromosome
  point=randint(0,len(list_item)-1)
  if new_chromosome[point]:
    new_chromosome[point]=0
  else:
    new_chromosome[point]=1
  return individual(new_chromosome)

def xover(i1,i2):
  point1=randint(0,len(list_item)-1)
  point2=randint(0,len(list_item)-1)
  if point1>point2:
    point1,point2=point2,point1
  chromosome1=i1.chromosome[:point1]+i2.chromosome[point1:point2]+i1.chromosome[point2:]
  chromosome2=i2.chromosome[:point1]+i1.chromosome[point1:point2]+i2.chromosome[point2:]
  return individual(chromosome1), individual(chromosome2)

def roulette_wheel(individuals, number):
  line=[(individuals[0], individuals[0].fitness)]
  for i in individuals[1:]:
    line.append((i, line[-1][1]+i.fitness))
  selected=[]
  # print("FT:"+str(line[-1][1]))
  for i in range(number):
    point=line[-1][1]*r()
    for j in line:
      if point<j[1]:
        selected.append(j[0])
        break
  return selected

def create_generation(parents):
  children=[]
  count=0
  while count<len(parents)-1:
    # print(parents[count])
    child1,child2=xover(parents[count],parents[count+1])
    if r()<0.3:
      child1=mutation(child1)
    if r()<0.3:
      child2=mutation(child2)
    children.append(child1)
    children.append(child2)
    count+=2
  return children


t1=time.time()

best_in_population=0
average=[]
output_buffer=""
read_from_file()
population=initial_population()
for i in range(number_of_generation):
  parents=roulette_wheel(population, number_of_population)
  children=create_generation(parents)
  population=roulette_wheel(parents+children, number_of_population)


  for i in population:
    if best_in_population<i.fitness:
      best_in_population=i.fitness
      best=i

  avg=0
  for i in population:
    avg=avg+i.fitness
  average.append(avg/len(population))
  # print(avg/len(population))

t2=time.time()

print(best.chromosome)
print(best.fitness)
print(t2-t1)
# print(average)


output_buffer+="var chromosome = '"+str(best.chromosome)+"';\n"
output_buffer+="var best = "+str(best.fitness)+";\n"
output_buffer+="var valuesRy = ["
for i in range(len(average)):
  output_buffer+=str(average[i])+", "
# print(output_buffer)
output_buffer+="]\n"
output_buffer+="var propsRy = ["
for i in range(len(average)):
  output_buffer+='"'+str(i)+'", '
output_buffer+="]\n"
writing_file=open("files/variable.txt" ,'w')
writing_file.write(output_buffer)
writing_file.close()  

