// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Contacts{
   uint public totalContacts=0;
   mapping(uint=>Contact) public contacts;

   struct Contact{
        uint id;
        string contactName;
        string phoneNumber;
        string description;
   }

   event ContactCreated(string contactName,string contactPhone,string desc);
   event EditContact(uint id);

   function createContact(string memory contactName,string memory contactPhone,string memory desc)public{
       totalContacts++;
       Contact storage c=contacts[totalContacts];
       c.id=totalContacts;
       c.contactName=contactName;
       c.phoneNumber=contactPhone;
       c.description=desc;
       emit ContactCreated(contactName, contactPhone, desc);
   }

   function editContact(uint contactId,string memory contactName,string memory contactPhone,string memory desc)public{
       Contact memory c=contacts[contactId];
       c.contactName=contactName;
       c.phoneNumber=contactPhone;
       c.description=desc;
       contacts[contactId]=c;
       emit ContactCreated(contactName, contactPhone, desc);
   }

   function deleteContact(uint id)public{
       delete contacts[id];
       totalContacts--;
       emit EditContact(id);
   }
}

