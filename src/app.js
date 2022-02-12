
App = {
    loading: false,
    contracts: {},
  
    load: async () => {
      await App.loadWeb3()
      await App.loadAccount()
      await App.loadContract()
      await App.render()
    },
    loadWeb3: async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum) // give provider as w.e to web3
        App.web3Provider=window.ethereum  // save provider in app
        try {
          // Request account access if needed
          await ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          // User denied account access...
        }
      } // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },
  
    loadAccount: async () => {
      // Set the current blockchain account
      const accounts = await ethereum.request({ method: 'eth_accounts' }); 
      App.account = accounts[0] 
    },
  
    loadContract: async () => {
        const contactList=await $.getJSON('Contacts.json')
        App.contracts.ContactList=TruffleContract(contactList)
        App.contracts.ContactList.setProvider(App.web3Provider)
        // Hydrate the smart contract with values from the blockchain
        App.contactList=await App.contracts.ContactList.deployed()
    },
  
    render: async () => {
      // Prevent double render
      if (App.loading) {
        return
      }
  
      // Update app loading state
      App.setLoading(true)
  
      // Render Account
      $('#account').html(App.account) 
      // Render Tasks
      await App.renderTasks()
  
      // Update loading state
      App.setLoading(false)
    },
  
    renderTasks: async () => {
      // Load the total task count from the blockchain
      const contactCounts = await App.contactList.totalContacts()
    
      // Render out each task with a new task template
      for (var i = 1; i <= contactCounts; i++) {
        // Fetch the contact data from the blockchain
        const contact = await App.contactList.contacts(i)
        const id=contact[0]
        const name = contact[1]
        const phone = contact[2]
        const desc = contact[3]
  
        // Create the html for the contact
        var row="<tr><th  scope='row'>"+i+"</th>";
        row+="<td>"+name+"</td>";
        row+="<td>"+phone+"</td>";
        row+="<td>"+desc+"</td>";
        row+=` <td>
                <a href='#' class='btn btn-info' onclick='App.popupEdit("${id}","${name}","${phone}","${desc}\")'>
                    <i class='fas fa-edit'></i>
                </a>
              </td>`;
        row+=` <td>
                <a href='#' class='btn btn-info' onclick='App.deleteContact("${id}")'>
                    <i class='fas fa-trash'></i>
                </a>
            </td>`;
        $('#contactList').append(row)
      }
    },
  
    createContact: async () => {
      App.setLoading(true)
      const name = $('#contactName').val()
      const phone = $('#contactPhone').val()
      const desc = $('#desc').val()
      await App.contactList.createContact(name,phone,desc,{from:App.account})
      window.location.reload()
    },
    popupEdit:(id,name,phone,desc)=>{ 
        $('.editBody').find('#edName').val(name)
        $('.editBody').find('#edPhone').val(phone)
        $('.editBody').find('#edDesc').val(desc)
        $('.editBody').find('#cid').val(id)
        $('#editContactModel').modal('show');
    },
    editContact: async () => {
        const name = $('#edName').val()
        const phone = $('#edPhone').val()
        const desc = $('#edDesc').val()
        const id = $('#cid').val()
       await App.contactList.editContact(id,name,phone,desc,{from:App.account})
       $('#editContactModel').modal('hide');
       App.setLoading(true)
       window.location.reload()
    },
    deleteContact:async(id)=>{
        App.setLoading(true)
        await App.contactList.deleteContact(id,{from:App.account})
        window.location.reload()
    },
    setLoading: (boolean) => {
      App.loading = boolean
      const loader = $('#loader')
      const content = $('#content')
      if (boolean) {
        loader.show()
        content.hide()
      } else {
        loader.hide()
        content.show()
      }
    }
  }
  
  $(() => {
    $(window).load(() => {
      App.load()
    })
  })