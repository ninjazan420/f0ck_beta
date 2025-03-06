import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Tag from '@/models/Tag';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const tagId = params.id;
    
    // Find by ID or name
    const tag = await Tag.findOne({
      $or: [
        { id: tagId },
        { name: tagId.toLowerCase() }
      ]
    });
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ tag });
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tag' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const tagId = params.id;
    const body = await request.json();
    
    // Find the tag
    const tag = await Tag.findOne({
      $or: [
        { id: tagId },
        { name: tagId.toLowerCase() }
      ]
    });
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    if (body.type) tag.type = body.type;
    if (body.aliases) tag.aliases = body.aliases;
    
    // Don't allow changing the name as it could break references
    
    await tag.save();
    
    return NextResponse.json({
      message: 'Tag updated successfully',
      tag
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const tagId = params.id;
    
    // Find the tag
    const tag = await Tag.findOne({
      $or: [
        { id: tagId },
        { name: tagId.toLowerCase() }
      ]
    });
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }
    
    // Delete the tag
    await Tag.deleteOne({ _id: tag._id });
    
    return NextResponse.json({
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
} 