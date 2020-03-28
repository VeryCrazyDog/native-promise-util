import { join } from 'path'

class Student {
  fullName: string;
  constructor (public firstName: string, public middleInitial: string, public lastName: string) {
    this.fullName = firstName + ' ' + middleInitial + ' ' + lastName + join(__dirname, 'test')
  }
}

interface Person {
  firstName: string
  lastName: string
}

function greeter (person: Person): string {
  return 'Hello, ' + person.firstName + ' ' + person.lastName
}

const user = new Student('Jane', 'M.', 'User')

function test (person: Person): string {
  const user1 = person
  return user1.lastName + 'asd'
}

console.log(greeter(user), test(user))

// declare const loggedInUsername: string

// const users = [
//   { name: 'Oby', age: 12 },
//   { name: 'Heera', age: 32 }
// ]

// const loggedInUser = users.find(u => u.name === loggedInUsername)
// console.log(loggedInUser.age)
