import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Radio,
  Select,
  Row,
  Col,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { addEntry, updateEntry, deleteEntry } from "./infoSlice";
import moment from "moment";
import axios from "axios";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";

const { Option } = Select;

const PersonalInfoTable = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const dispatch = useDispatch();
  const entries = useSelector((state) => state.info);
  const [form] = Form.useForm();

  // State variables for country, states, cities
  const [countryCodes, setCountryCodes] = useState([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState(null);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null); // New state variable for selected state
  const [cities, setCities] = useState([]); // State for cities
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [addressLines, setAddressLines] = useState([{ line: "" }]);

  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        const codes = response.data.map((country) => ({
          code: country.cca2,
          name: country.name.common,
          callingCode:
            country.idd.root +
            (country.idd.suffixes && country.idd.suffixes.length > 0
              ? country.idd.suffixes[0]
              : ""),
        }));
        setCountryCodes(codes);
      } catch (error) {
        console.error("Error fetching country codes:", error);
      }
    };

    fetchCountryCodes();
  }, []);

  const handleCountryChange = async (code) => {
    setSelectedCountryCode(code);
    const country = countryCodes.find((c) => c.callingCode === code);
    setSelectedCountry(country ? country.name : null);

    if (country) {
      try {
        const response = await axios.post(
          "https://countriesnow.space/api/v0.1/countries/states",
          { country: country.name }
        );

        if (response.data.data && response.data.data.states) {
          setStates(response.data.data.states);
        } else {
          setStates([]);
        }
      } catch (error) {
        console.error("Error fetching states:", error);
        setStates([]);
      }
    } else {
      setStates([]);
    }
  };

  const handleStateChange = async (stateName) => {
    setSelectedState(stateName);
    try {
      const response = await axios.post(
        "https://countriesnow.space/api/v0.1/countries/state/cities",
        {
          country: selectedCountry,
          state: stateName,
        }
      );
      if (response.data.data) {
        setCities(response.data.data);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    }
  };

  const showAddModal = () => {
    setEditingEntry(null);
    setIsModalVisible(true);
    setAddressLines([{ line: "" }]);
    setSelectedCountryCode(null);
    setSelectedCountry(null);
    setStates([]);
    setCities([]); 
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedCountryCode(null);
    setSelectedCountry(null);
    setStates([]);
    setCities([]); 
  };

  const onSubmit = (values) => {
    const finalValues = {
      ...values,
      countryCode: selectedCountryCode,
      country: selectedCountry,
      addressLines: addressLines.map((address) => address.line),
    };
    if (editingEntry) {
      dispatch(updateEntry({ id: editingEntry.id, data: finalValues }));
    } else {
      dispatch(addEntry({ id: Date.now(), ...finalValues }));
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const onEdit = (record) => {
    setEditingEntry(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...record,
      dob: moment(record.dob),
    });
    setSelectedCountryCode(record.countryCode);
    setSelectedCountry(record.country);
    setAddressLines(record.addressLines.map((line) => ({ line })));
    handleCountryChange(record.countryCode);
  };

  const onDelete = (id) => {
    dispatch(deleteEntry(id));
  };

  const addAddressLine = () => {
    setAddressLines([...addressLines, { line: "" }]);
  };

  const handleAddressLineChange = (index, value) => {
    const newAddressLines = [...addressLines];
    newAddressLines[index].line = value;
    setAddressLines(newAddressLines);
  };

  const showDetailsModal = (record) => {
    setSelectedEntry(record);
    setIsDetailsModalVisible(true);
  };

  const handleDetailsCancel = () => {
    setIsDetailsModalVisible(false);
    setSelectedEntry(null);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedEntries = Array.from(entries);
    const [removed] = reorderedEntries.splice(result.source.index, 1);
    reorderedEntries.splice(result.destination.index, 0, removed);

  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Country", dataIndex: "country", key: "country" },
    { title: "State", dataIndex: "state", key: "state" },
    { title: "City", dataIndex: "city", key: "state" },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <>
          <Button
            onClick={() => onEdit(record)}
            style={{
              borderRadius: "50%",
              marginRight: 8, 
            }}
          >
            <FaRegEdit />
          </Button>
          <Button
            onClick={() => onDelete(record.id)}
            style={{
              borderRadius: "50%",
              marginRight: 8,
            }}
          >
            <MdDeleteOutline />
          </Button>
          <Button
            onClick={() => showDetailsModal(record)}
            style={{
              borderRadius: "50%",
            }}
          >
            <FaRegEye />
          </Button>
        </>
      ),
    }
    
  ];

  return (
    <>
   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <h2 style={{ margin: 0 }}>Personal Info</h2>
      <Button type="primary" onClick={showAddModal}>
        Add Information
      </Button>
   </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="entries">
          {(provided) => (
            <Table
              dataSource={entries}
              columns={columns}
              rowKey="id"
              {...provided.droppableProps}
              ref={provided.innerRef}
              pagination={false}
              scroll={{ x: "max-content" }}
              size="middle"
            />
          )}
        </Droppable>
      </DragDropContext>

      {/* Add/Edit Entry Modal */}
      <Modal
        title={editingEntry ? "Edit Entry" : "Add Entry"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={form.submit}>
            Submit
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Country Code" required>
            <Select
              value={selectedCountryCode}
              onChange={handleCountryChange}
              placeholder="Select Country Code"
              showSearch
            >
              {countryCodes.map((country) => (
                <Option key={country.code} value={country.callingCode}>
                  {country.name} ({country.callingCode})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dob" label="Date of Birth" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item
            label="Gender"
            name="gender"
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
              <Radio value="other">Other</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Country" rules={[{ required: true }]}>
            <Select value={selectedCountry} placeholder="Select Country" disabled>
              {countryCodes.map((country) => (
                <Option key={country.code} value={country.name}>
                  {country.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="State" name="state" rules={[{ required: true }]}>
            <Select placeholder="Select State" onChange={handleStateChange}>
              {states.map((state) => (
                <Option key={state.name} value={state.name}>
                  {state.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="City" name="city" rules={[{ required: true }]}>
            <Select placeholder="Select City">
              {cities.map((city) => (
                <Option key={city} value={city}>
                  {city}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Address" rules={[{ required: true }]}>
            {addressLines.map((address, index) => (
              <Row key={index} gutter={8} style={{ marginBottom: "16px" }}>
                <Col span={20}>
                  <Input
                    value={address.line}
                    onChange={(e) =>
                      handleAddressLineChange(index, e.target.value)
                    }
                    placeholder={`Address Line ${index + 1}`}
                  />
                </Col>
              </Row>
            ))}
            <Row>
              <Col span={4}>
                <Button
                  type="dashed"
                  onClick={addAddressLine}
                  style={{ marginTop: "16px" }}
                >
                  Add Line
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/* Entry Details Modal */}
      <Modal
        title="Entry Details"
        visible={isDetailsModalVisible}
        onCancel={handleDetailsCancel}
        footer={[
          <Button key="close" onClick={handleDetailsCancel}>
            Close
          </Button>,
        ]}
      >
        {selectedEntry && (
          <div>
            <p><strong>Name:</strong> {selectedEntry.name}</p>
            <p><strong>Email:</strong> {selectedEntry.email}</p>
            <p><strong>Phone:</strong> {selectedEntry.phone}</p>
            <p><strong>Country:</strong> {selectedEntry.country}</p>
            <p><strong>State:</strong> {selectedEntry.state}</p>
            <p><strong>City:</strong> {selectedEntry.city}</p>
            <p><strong>Date of Birth:</strong> {moment(selectedEntry.dob).format("YYYY-MM-DD")}</p>
            <p><strong>Gender:</strong> {selectedEntry.gender}</p>
            <p><strong>Address:</strong> {selectedEntry.addressLines.join(", ")}</p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default PersonalInfoTable;
