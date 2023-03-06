import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default class Contacts extends Component {
  static navigationOptions = {
    title: 'Contacts',
  };

  state = {
    contacts: [],
    photos: {}, // map of contact IDs to photo URLs
    error: null,
  };

  async componentDidMount() {
    this.getContacts();
  }

  getContacts = async () => {
    fetch('http://localhost:3333/api/1.0.0/contacts', {
      headers: {
        'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
        'Accept': 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 500) {
          throw new Error('Server Error');
        } else {
          throw new Error('Not Found');
        }
      })
      .then(async (data) => {
        const contacts = data.map((contact) => ({
          id: contact.user_id.toString(),
          name: `${contact.first_name} ${contact.last_name}`,
        }));

        // Call get_profile_image for each contact
        for (const contact of contacts) {
          await this.get_profile_image(contact.id);
        }

        this.setState({ contacts, error: null });
      })
      .catch((error) => {
        this.setState({ error: error.message });
      });
  }

  get_profile_image = async (contactId) => {
    const session_token = await AsyncStorage.getItem('whatsthat_session_token');
    fetch(`http://localhost:3333/api/1.0.0/user/`+contactId+`/photo`, {
        method: "GET",
        headers: {
          'X-Authorization': session_token,
        }
    })
    .then((res) => {
        if(res.status === 200){
          return res.blob()
        }
        else if(res.status === 401){
          throw new Error("Unauthorized")
        }
        else if(res.status === 404){
          throw new Error("Not Found")
        }
        else{
          throw new Error("Server Error")
        }
    })
    .then((resBlob) => {
        let data = URL.createObjectURL(resBlob);
        this.setState(prevState => ({
            photos: {
                ...prevState.photos,
                [contactId]: data,
            },
        }))
    })
    .catch((err) => {
        console.log(err)
    })
  }
      
  removeContact = async (contact) => {
    const { id } = contact;
    fetch(`http://localhost:3333/api/1.0.0/user/`+id+`/contact`, {
      method: 'DELETE',
      headers: {
        'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 200) {
          this.getContacts(); // call getContacts() to update the list of contacts
        } else if (response.status === 400) {
          throw new Error("You can't remove yourself as a contact");
        } else if (response.status === 401) {
          throw new Error('Unauthorized');
        } else if (response.status === 404) {
          throw new Error('Not Found');
        } else if (response.status === 500) {
          throw new Error('Server Error');
        } else {
          throw new Error('Error');
        }
      })
      .catch((error) => {
        this.setState({ error: error.message });
      });
  }

  blockUser = async (contact) => {
    const { id } = contact;
    fetch(`http://localhost:3333/api/1.0.0/user/`+id+`/block`, {
      method: 'POST',
      headers: {
        'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 200) {
          this.getContacts(); // Call getContacts to update the contact list
        } else if (response.status === 400) {
          throw new Error("You can't block yourself as a contact");
        } else if (response.status === 401) {
          throw new Error('Unauthorized');
        } else if (response.status === 404) {
          throw new Error('Not Found');
        } else if (response.status === 500) {
          throw new Error('Server Error');
        } else {
          throw new Error('Error');
        }
      })
      .catch((error) => {
        this.setState({ error: error.message });
      });
  };
  

render() {
  const { contacts, error, photos } = this.state;

  function orderContacts(contacts) {
    const order = {};

    // group the contacts by their first letter of the name
    contacts.forEach(contact => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      if (!order[firstLetter]) {
        order[firstLetter] = [];
      }
      order[firstLetter].push(contact);
    });

    // convert the groups object to an array of sections
    const sections = Object.keys(order).sort().map(letter => ({
      title: letter,
      data: order[letter],
    }));

    return sections;
  }

  const orderedContacts = orderContacts(contacts);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Contacts</Text>
        <TouchableOpacity
          style={styles.viewBlockedButton}
          onPress={() => this.props.navigation.navigate('Blocked')}
        >
          <Text style={styles.viewBlockedText}>View Blocked Users</Text>
        </TouchableOpacity>
      </View>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <SectionList
          sections={orderedContacts}
          renderItem={({ item }) => (
            <View style={styles.contactContainer}>
              <View style={styles.photoContainer}>
                {photos[item.id] ? (
                  <Image source={{ uri: photos[item.id] }} style={styles.photo} />
                ) : (
                  <Text style={styles.noPhotoText}>No photo</Text>
                )}
              </View>
              <Text style={styles.contactName}>{item.name}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => this.removeContact(item)}
                >
                  <Icon name="delete" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.blockButton}
                  onPress={() => this.blockUser(item)}
                >
                  <Text style={styles.buttonText}>Block</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
          }
        }  
    
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewBlockedButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#6B55E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBlockedText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#FF0000',
  },
  sectionHeader: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  deleteButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  blockButton: {
    backgroundColor: '#6B55E6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    },
    photo: {
    width: 75,
    height: 75,
    borderRadius: 40,
    },
    noPhotoText: {
    fontSize: 12,
    color: '#999',
    },
});
