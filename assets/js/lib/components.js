/** @jsx vNode */

/**

This is our list of components to be used in the app.

**/
export { EventListFull, EventFull, EventList, EventSearch };
import { vNode } from '../../../node_modules/@ocdladefense/view/view.js';
import { CACHE, HISTORY } from '../../../node_modules/@ocdladefense/view/cache.js';
import { cityFormatter, stateFormatter, createMemberX } from './contactFieldFormat.js';

var EventListFull = function EventListFull(props) {
  return vNode("div", null, vNode(EventSearch, {
    searchBar: props.searchBar,
    datesChecked: props.datesChecked,
    contactsChecked: props.contactsChecked
  }), vNode(EventList, {
    events: props.events
  }));
};

var EventSearch = function EventSearch(props) {
  var searchBar = props.searchBar;
  var datesChecked = props.datesChecked;
  var contactsChecked = props.contactsChecked;
  return vNode("div", {
    "class": "flex-parent object-list",
    id: "searchArea"
  }, vNode("h1", null, "My Object"), vNode("h3", null, "Recent records"), vNode("h3", null, "Record search"), vNode("div", {
    "class": "form-item"
  }, vNode("input", {
    type: "text",
    id: "record-search",
    placeholder: "Enter search terms...",
    value: searchBar
  })), vNode("div", {
    "class": "form-item"
  }, vNode("input", {
    type: "button",
    id: "submit-search",
    "data-action": "search",
    value: "search"
  })), vNode("div", {
    "class": "form-item"
  }, vNode("label", null, "Dates from Oldest to Newest"), vNode("input", {
    type: "checkbox",
    id: "date-checkbox",
    checked: datesChecked ? true : null
  })), vNode("div", {
    "class": "form-item"
  }, vNode("label", null, "Number of Attendees from Highest to Lowest"), vNode("input", {
    type: "checkbox",
    id: "contacts-checkbox",
    checked: contactsChecked ? true : null
  })));
};

var EventList = function EventList(props) {
  var events = props.events;
  var list = [];

  for (var i = 0; i < events.length; i++) {
    list.push(vNode(EventListItem, {
      event: events[i]
    }));
  }

  return vNode("div", {
    "class": "flex-parent record-list",
    id: "record-list-3"
  }, list);
};

var EventListItem = function EventListItem(props) {
  // let theCount = parseInt(CACHE.get("eventsContactCount")[props.event.Id] && CACHE.get("eventsContactCount")[props.event.Id].expr0).toString();
  // theCount = CACHE.get("eventsContactCount")[props.event.Id] ? theCount : "None";
  var theCount = "5";
  return vNode("div", {
    "class": "record-list-item"
  }, vNode("h3", null, vNode("a", {
    "class": "record-button record-button-2",
    href: "#" + props.event.Id,
    "data-action": "details",
    "data-event-id": props.event.Id
  }, props.event.Name)), vNode("p", null, props.event.Banner_Location_Text__c), vNode("p", null, props.event.Start_Date__c), vNode("p", null, "Attendees: ", theCount));
};

var EventFull = function EventFull(props) {
  return vNode("div", null, vNode(EventDetails, {
    event: props.event
  }));
};

var EventDetails = function EventDetails(props) {
  var event = props.event;
  return vNode("div", null, vNode("h1", {
    "class": "margin-maker-2"
  }, event.Name), vNode("h3", {
    "class": "margin-maker"
  }, event.Start_Date__c), vNode("a", {
    href: "https://ocdla.force.com/OcdlaEvent?id=" + event.Id,
    target: "_blank",
    "class": "margin-maker"
  }, "Link to the event page in more detail."));
};

var ContactList = function ContactList(props) {
  var contacts = props.contacts;
  var attendees = [];

  for (var i = 0; i < contacts.length; i++) {
    if (contacts[i].Contact__r != null) {
      attendees.push(vNode(Attendee, {
        contact: contacts[i]
      }));
    }
  }

  return vNode("div", {
    "class": "flex-parent contact-list",
    id: "contactList3"
  }, vNode("br", null), vNode("h3", null, "List of Attendees"), vNode("p", null, "An X by the name indicates membership."), vNode("ul", {
    "class": "table-row should-be-invisible table-headers"
  }, vNode("li", {
    "class": "table-cell"
  }, "Name"), vNode("li", {
    "class": "table-cell"
  }, "Order Date"), vNode("li", {
    "class": "table-cell"
  }, "Ticket Type"), vNode("li", {
    "class": "table-cell"
  }, "Location")), attendees);
};

var Attendee = function Attendee(props) {
  var _contact$Contact__r$M;

  var contact = props.contact;
  return vNode("ul", {
    "class": "table-row"
  }, vNode("li", {
    "class": "table-cell attendee-name"
  }, contact.Contact__r.Name + createMemberX(contact.Contact__r.Ocdla_Current_Member_Flag__c)), vNode("li", {
    "class": "table-cell attendee-order-date"
  }, contact.Order.EffectiveDate), vNode("li", {
    "class": "table-cell attendee-ticket-name"
  }, contact.Product2.Name), vNode("li", {
    "class": "table-cell attendee-city"
  }, ((_contact$Contact__r$M = contact.Contact__r.MailingCity) !== null && _contact$Contact__r$M !== void 0 ? _contact$Contact__r$M : ' ') + stateFormatter(contact.Contact__r.MailingState)));
};