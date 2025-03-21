import { useState, useEffect } from "react";
import {
  Input,
  Form,
  DatePicker,
  TimePicker,
  InputNumber,
  Row,
  Col,
  Button,
  Space,
  Tooltip,
} from "antd";

import { PhoneOutlined, CalendarOutlined } from "@ant-design/icons";
import { CalendarComponent } from "./Calendar";
import moment from "moment";
import { createAppointment, updateAppointment } from "../../apiService";
import { Message } from "../../components/message/Message";

export function AppointmentForm({
  setRefetchData,
  selectedRecord = null,
  closeDrawer,
  setLoading
}) {
  const [form] = Form.useForm();
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [refetchCalendarData, setRefetchCalendarData] = useState(false);

  // Pre-fill the form if editing
  useEffect(() => {
    if (selectedRecord) {
      const appointmentDate = moment(selectedRecord.appointmentDate);
      form.setFieldsValue({
        patientName: selectedRecord.patientName,
        appointmentDate: !appointmentDate.isBefore(moment(), "day")
          ? moment(selectedRecord.appointmentDate)
          : null,
        appointmentTime: !appointmentDate.isBefore(moment(), "day")
          ? moment(selectedRecord.appointmentTime, "HH:mm")
          : null,
        patientAge: selectedRecord.patientAge,
        contactNumber: selectedRecord.contactNumber,
      });
      setSelectedDate(moment(selectedRecord.appointmentDate));
    }
  }, [selectedRecord, form]);

  const handleCalendarButtonClick = () => {
    setIsCalendarVisible((prev) => !prev);
  };

  const disabledDate = (current) => {
    return current && current < moment().startOf("day"); // Disable past dates
  };

  const disabledTime = () => {
    if (!selectedDate) return {}; // If no date selected, allow all times

    if (selectedDate.isSame(moment(), "day")) {
      // If today, disable past hours and minutes
      const currentHour = moment().hour();
      const currentMinute = moment().minute();

      return {
        disabledHours: () => Array.from({ length: currentHour }, (_, i) => i), // Disable past hours
        disabledMinutes: (selectedHour) =>
          selectedHour === currentHour
            ? Array.from({ length: currentMinute }, (_, i) => i) // Disable past minutes if same hour
            : [],
      };
    }

    return {}; // For future dates, allow all times
  };

  const handleDateChange = (date, dateString) => {
    setSelectedDate(date);
};
const onFinish = async (values) => {
  if (!selectedDate) {
    return;
  }

  // Format date to "YYYY-MM-DD"
  const formattedDate = selectedDate.format("YYYY-MM-DD");

  // Format time to "HH:MM AM/PM"
  const formattedTime = moment(values.appointmentTime).format("hh:mm A");

  // Prepare the final values object
  const formattedValues = {
    ...values,
    appointmentDate: formattedDate,
    appointmentTime: formattedTime,
  };

  try {
    if (setLoading) setLoading(true); // Check before using setLoading
    let response;

    if (selectedRecord) {
      response = await updateAppointment(selectedRecord._id, formattedValues);
    } else {
      response = await createAppointment(formattedValues);
    }

    if (response.status === 200) {
      Message("success", response.message, 2);
      form.resetFields();
      setRefetchCalendarData(true);
      setRefetchData(true);
      if (selectedRecord) {
        closeDrawer();
      }
    }
  } catch (error) {
    console.error("Failed to save appointment:", error);
  } finally {
    if (setLoading) setLoading(false);
  }
};


  return (
    <>
      <Form
        form={form} // Attach form instance
        onFinish={onFinish}
        name="layout-multiple-horizontal"
        layout="vertical"
        labelCol={{ span: 6 }} // Increase this value
        wrapperCol={{ span: 18 }} // Adjust accordingly
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Patient Name"
              name="patientName"
              rules={[{ required: true, message: "Patient name is required" }]}
            >
              <Input
                size="large"
                placeholder="Patient Name"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Date"
              name="appointmentDate"
              rules={[{ required: true, message: "Date is required" }]}
            >
              <DatePicker
                size="large"
                style={{ width: "100%" }}
                disabledDate={disabledDate}
                onChange={handleDateChange}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Time"
              name="appointmentTime"
              rules={[
                { required: true, message: "Time is required" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!getFieldValue("appointmentDate")) {
                      return Promise.reject(
                        new Error("Please select a date first!")
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <TimePicker
                size="large"
                style={{ width: "100%" }}
                format="HH:mm"
                use12Hours={false}
                disabledTime={disabledTime} // Use the new function here
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Patient Age"
              name="patientAge"
              rules={[{ required: true, message: "Age is required" }]}
            >
              <InputNumber
                size="large"
                min={1}
                max={100}
                parser={(value) => value.replace(/\D/g, "")} // Strips non-numeric input
                onKeyPress={(e) => {
                  if (!/^\d+$/.test(e.key)) {
                    e.preventDefault(); // Prevents non-numeric key press
                  }
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Contact Number"
              name="contactNumber"
              rules={[
                { required: true, message: "Contact number is required" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Contact number must be exactly 10 digits",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="0701231231"
                prefix={<PhoneOutlined />}
                style={{ width: "100%" }}
                maxLength={10} // Prevents entering more than 10 characters
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="ㅤ" rules={[{ required: true }]}>
              <Space size={"large"}>
                <Button
                  style={{ backgroundColor: "#16BE12", color: "#fff" }}
                  size="large"
                  type="primary"
                  htmlType="submit"
                >
                  {selectedRecord ? "Update Appointment" : "Add Appointment"}
                </Button>
                <Button
                  style={{ backgroundColor: "#000", color: "#fff" }}
                  size="large"
                  type="primary"
                  onClick={() => form.resetFields()}
                >
                  Clear
                </Button>

                <Tooltip title="Calendar">
                  <Button
                    size="large"
                    type="primary"
                    icon={<CalendarOutlined />}
                    onClick={handleCalendarButtonClick}
                  />
                </Tooltip>
              </Space>
            </Form.Item>
          </Col>
        </Row>
        {isCalendarVisible && <CalendarComponent refetchCalendarData={refetchCalendarData} setRefetchCalendarData={setRefetchCalendarData}/>}
      </Form>
    </>
  );
}
