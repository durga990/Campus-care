const defaultApi = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  ? `${window.location.origin}/api`
  : 'http://localhost:5000/api';
const BASE = import.meta.env.VITE_API_URL || defaultApi;
export const FILES = BASE.replace(/\/api$/, '');
export const MESSAGE_TYPES = ['Grievance', 'Assistance', 'Enquiry', 'Feedback', 'Positive Feedback'];
export const CATEGORIES = [
  'Air Conditioner',
  'Carpentry',
  'Desert Cooler/Air Cooler (Electrical)',
  'Desert Cooler/Air Cooler (Plumbing)',
  'Electricity',
  'Energy Meter',
  'Gas Welder',
  'Lift',
  'Marking',
  'Mason',
  'Plumbing',
  'School of AI and Emerging Technologies',
  'Sewerage',
  'Tailor',
  'Water Cooler/Drinking water(Cooling Issue)',
  'Water Cooler/Drinking water(Electrical Issue)',
  'Water Cooler/Drinking water(Plumbing Issue)',
  'Infrastructure',
  'Computer Lab',
  'Wi-Fi / Internet',
  'Cleanliness',
  'Other'
];
export const BLOCKS = [
  'Academic Block A',
  'Academic Block B',
  'Academic Block C',
  'Science & Technology Block',
  'Hostel Block 1 (Boys)',
  'Hostel Block 2 (Boys)',
  'Hostel Block 3 (Girls)',
  'Hostel Block 4 (Girls)',
  'Central Library',
  'Student Dining / Mess',
  'Sports Complex',
  'Administrative Block'
];
export const SUB_BLOCKS = [
  'Wing A',
  'Wing B',
  'Wing C',
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
  'Corridor / Common Area'
];
export const TIME_SLOTS = [
  '08:00-10:00',
  '10:00-12:00',
  '12:00-14:00',
  '14:00-16:00',
  '16:00-18:00'
];
export const SUB_CATEGORIES = {
  'Air Conditioner': ['Not Cooling / Warm Air', 'Water Dripping / Leakage', 'Remote Control Broken', 'Strange Noise / Rattling', 'Power Trip on Start', 'General Service'],
  'Carpentry': ['Broken Door / Lock', 'Chair / Desk Damage', 'Window Latch Damaged', 'Cupboard Hinge Broken', 'Bed Wooden Plank Repair'],
  'Desert Cooler/Air Cooler (Electrical)': ['Fan Motor Not Working', 'Water Pump Dead', 'Electrical Spark / Shock', 'Regulator Speed Fault'],
  'Desert Cooler/Air Cooler (Plumbing)': ['Water Overflowing', 'Float Valve Broken', 'Inlet Pipe Leakage', 'Cooler Pad Clogged'],
  'Electricity': ['Power Outage in Room', 'Light / Tube Fixture Fuse', 'Switchboard / Socket Broken', 'Fan Regulator / Bearing', 'Circuit Breaker Trip'],
  'Energy Meter': ['Meter Blank / Off', 'Erratic Reading / High Rate', 'Burning Odour near Board'],
  'Gas Welder': ['Window Grill Detached', 'Staircase Railing Broken', 'Door Catch Broken', 'Metal Bed Frame Welding'],
  'Lift': ['Elevator Stuck / Jammed', 'Floor Buttons Not Responding', 'Door Sensor Fault', 'Indicator Blank'],
  'Marking': ['Whiteboard Stained / Damaged', 'Notice Board Repair', 'Directional Signage Replacement'],
  'Mason': ['Broken Floor Tile', 'Wall Plaster Falling', 'Ceiling Dampness / Seepage', 'Bathroom Step Chipped'],
  'Plumbing': ['Water Tap Continuously Leaking', 'Flush Tank Broken / Not Filling', 'Washbasin Drain Clogged', 'Shower Head Blocked', 'No Water Supply'],
  'School of AI and Emerging Technologies': ['Lab Workstation GPU / PSU Issue', 'High Speed Switch / LAN Port Fault', 'Overhead Projector No Signal', 'Airflow Cooling Fault in Server Rack'],
  'Sewerage': ['Drain Line Overflowing', 'Severe Foul Odour', 'Main Manhole Clogged', 'Floor Drain Backflow'],
  'Tailor': ['Curtain Stitching / Ring Broken', 'Hostel Mattress Cover Tear', 'Sofa Cushion Repair'],
  'Water Cooler/Drinking water(Cooling Issue)': ['Water Not Cooling', 'Compressor Not Turning On', 'Thermostat Failure'],
  'Water Cooler/Drinking water(Electrical Issue)': ['Current / Electric Shock in Body', 'Power Cord Damaged', 'Indicator LED Off'],
  'Water Cooler/Drinking water(Plumbing Issue)': ['Water Tap Leaking', 'Wastewater Pipe Choked', 'Inflow Water Supply Cutoff'],
  'Infrastructure': ['Ceiling Seepage', 'Door / Window Frame', 'Road / Path Repair', 'Streetlight Out'],
  'Computer Lab': ['System Not Booting', 'Mouse / Keyboard Missing', 'Monitor Blinking', 'OS Crash'],
  'Wi-Fi / Internet': ['No Wi-Fi Signal', 'DNS / Authentication Failed', 'Frequent Disconnections', 'Slow Speed'],
  'Cleanliness': ['Room Cleaning Needed', 'Corridor Trash Accumulation', 'Washroom Deep Clean Required'],
  'Other': ['General Inquiry / Other Maintenance']
};
export const PRIORITIES = ['Low','Medium','High','Urgent'];
export const LABEL = {SUBMITTED:'Submitted',ASSIGNED:'Assigned',IN_PROGRESS:'In Progress',RESOLVED:'Resolved',CLOSED:'Closed',REJECTED:'Rejected'};
export async function api(path,{method='GET',body,form}={}) {
  const t = localStorage.getItem('cc_token'); const h = {};
  if (t) h.Authorization = 'Bearer ' + t;
  if (body) h['Content-Type'] = 'application/json';
  let r;
  try { r = await fetch(BASE + path,{method,headers:h,body:form || (body && JSON.stringify(body))}); }
  catch { throw new Error('Cannot reach the server. Check that the backend is running at ' + FILES + ' and restart it after editing .env.'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) {
    const detail = (j.errors || []).map(e => (e.field ? e.field + ': ' : '') + e.message).join('. ');
    throw new Error((j.message || 'Request failed (' + r.status + ')') + (detail ? ' ' + detail : ''));
  }
  return j.data;
}
