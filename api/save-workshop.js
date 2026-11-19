import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://omkarparelkarwork_db_user:omkarparelkar1123232@ac-qihkhkq-shard-00-00.sohnwre.mongodb.net:27017,ac-qihkhkq-shard-00-01.sohnwre.mongodb.net:27017,ac-qihkhkq-shard-00-02.sohnwre.mongodb.net:27017/kaushalya_db?ssl=true&replicaSet=atlas-6jb3jg-shard-0&authSource=admin';

let cachedClient = null;

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI);
    await cachedClient.connect();
  }
  return cachedClient.db('kaushalya_db');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await getDb();
    const workshopsCol = db.collection('workshops');

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }

    // ─────────────────────────────────────────────────────────────
    // GET: List all workshops or single workshop
    // ─────────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const { id } = req.query || {};
      if (id) {
        const query = {
          $or: [
            { _id: id },
            { id: id },
            ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : [])
          ]
        };
        const item = await workshopsCol.findOne(query);
        if (!item) return res.status(404).json({ success: false, error: 'Workshop not found' });
        return res.status(200).json({ success: true, workshop: item });
      }

      const list = await workshopsCol.find({}).sort({ date: 1 }).toArray();
      return res.status(200).json({ success: true, count: list.length, data: list });
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE: Delete workshop
    // ─────────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      const id = (req.query && req.query.id) || (body && body.id);
      if (!id) {
        return res.status(400).json({ success: false, error: 'Workshop ID is required for deletion.' });
      }
      const query = {
        $or: [
          { _id: id },
          { id: id },
          ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : [])
        ]
      };
      await workshopsCol.deleteOne(query);
      return res.status(200).json({ success: true, message: 'Workshop deleted successfully.' });
    }

    // ─────────────────────────────────────────────────────────────
    // POST / PUT: Create or Update workshop with guaranteed FREE pricing & custom image
    // ─────────────────────────────────────────────────────────────
    if (req.method === 'POST' || req.method === 'PUT') {
      const {
        id,
        _id,
        title,
        summary,
        description,
        category,
        bannerImageUrl,
        bannerImagePublicId,
        date,
        startTime,
        endTime,
        venue,
        venueAddress,
        latitude,
        longitude,
        mapUrl,
        onlineMode,
        meetingLink,
        capacity,
        registrationDeadline,
        learningOutcomes,
        status,
        pricingType,
        price,
        currency,
        razorpayKeyId,
        organizerId,
        organizerNameSnapshot,
      } = body || {};

      const workshopId = id || _id || ('ws-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6));

      // Build query to find existing record
      const query = {
        $or: [
          { _id: workshopId },
          { id: workshopId },
          ...(ObjectId.isValid(workshopId) ? [{ _id: new ObjectId(workshopId) }] : [])
        ]
      };

      const existing = await workshopsCol.findOne(query);

      // Enforce FREE vs PAID pricing logic
      const isFree = pricingType === 'FREE' || Number(price) === 0 || (existing && existing.pricingType === 'FREE' && price === undefined);
      const cleanPricingType = isFree ? 'FREE' : 'PAID';
      const cleanPrice = isFree ? 0.0 : (Number(price) || (existing?.price) || 0.0);

      const workshopDoc = {
        title: (title || existing?.title || '').trim(),
        summary: (summary || existing?.summary || title || '').trim(),
        description: (description || existing?.description || title || '').trim(),
        category: category || existing?.category || 'Web Development',
        bannerImageUrl: bannerImageUrl || existing?.bannerImageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
        bannerImagePublicId: bannerImagePublicId !== undefined ? bannerImagePublicId : (existing?.bannerImagePublicId || ''),
        date: date || existing?.date || new Date().toISOString().split('T')[0],
        startTime: startTime || existing?.startTime || '10:00',
        endTime: endTime || existing?.endTime || '13:00',
        venue: venue || existing?.venue || (onlineMode ? 'Online Webcast' : 'Engineering Hall Lab 201'),
        venueAddress: venueAddress !== undefined ? venueAddress : (existing?.venueAddress || ''),
        latitude: latitude !== undefined ? latitude : (existing?.latitude ?? null),
        longitude: longitude !== undefined ? longitude : (existing?.longitude ?? null),
        mapUrl: mapUrl !== undefined ? mapUrl : (existing?.mapUrl || ''),
        onlineMode: onlineMode !== undefined ? Boolean(onlineMode) : (existing?.onlineMode ?? false),
        meetingLink: meetingLink !== undefined ? meetingLink : (existing?.meetingLink || ''),
        capacity: Number(capacity) || existing?.capacity || 30,
        registrationDeadline: registrationDeadline || existing?.registrationDeadline || date,
        learningOutcomes: Array.isArray(learningOutcomes) 
          ? learningOutcomes 
          : (learningOutcomes ? String(learningOutcomes).split('\n').filter(Boolean) : (existing?.learningOutcomes || [])),
        status: status || existing?.status || 'PUBLISHED',
        pricingType: cleanPricingType,
        price: cleanPrice,
        currency: currency || existing?.currency || 'INR',
        razorpayKeyId: razorpayKeyId !== undefined ? razorpayKeyId : (existing?.razorpayKeyId || ''),
        organizerId: organizerId || existing?.organizerId || 'usr-org-1',
        organizerNameSnapshot: organizerNameSnapshot || existing?.organizerNameSnapshot || 'Faculty Organizer',
        updatedAt: new Date().toISOString(),
      };

      if (existing) {
        await workshopsCol.updateOne(
          { _id: existing._id },
          { $set: workshopDoc }
        );
        return res.status(200).json({
          success: true,
          message: 'Workshop updated successfully in database.',
          workshop: { ...workshopDoc, id: existing._id }
        });
      } else {
        workshopDoc._id = workshopId;
        workshopDoc.id = workshopId;
        workshopDoc.createdAt = new Date().toISOString();
        await workshopsCol.insertOne(workshopDoc);
        return res.status(201).json({
          success: true,
          message: 'Workshop created successfully in database.',
          workshop: workshopDoc
        });
      }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in save-workshop:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal error' });
  }
}
